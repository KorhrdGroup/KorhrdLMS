import { createClient } from "@/lib/supabase/server";

/**
 * 옛 시스템 수강 이력 자동 복원.
 *
 * 회원 7,903명 이관 전까지, 옛 시스템에서 수강했던 분이 새로 가입하면
 * (일반·소셜·오피스 자동발급 모두) 이관돼 있는 옛 자격증신청(legacy_no 있는
 * 8,849건)에서 같은 사람을 찾아:
 *   1) 그 신청 건들을 새 계정에 연결하고
 *   2) 과정을 찾을 수 있으면 수강완료(100%) 기록까지 만들어 줍니다.
 * (최은주 님 수동 복원(이관 8754번, 2026-08-19)과 같은 처리의 자동판)
 *
 * 매칭은 보수적으로만 합니다 — 잘못 연결하면 남의 이력이 붙습니다:
 *   1순위: 옛 아이디가 새 아이디와 정확히 일치
 *   2순위: 이름 + 생년월일 + 전화번호(숫자만)가 모두 일치
 * 애매하면 연결하지 않고 넘어갑니다(문의 오면 수동 처리).
 *
 * 가입 흐름을 막으면 안 되므로 호출부는 실패해도 가입을 계속 진행합니다.
 */

const norm = (value: string) => value.normalize("NFC").replace(/\s+/g, "");
const digits = (value: string) => value.replace(/\D/g, "");

type LegacyApplication = {
  id: string;
  legacy_no: number;
  certificate_name: string;
  course_id: string | null;
  education_start_date: string | null;
  education_end_date: string | null;
  applied_at: string;
};

type CourseRow = { id: string; name: string };

/** 과정명 매칭 — 정확 일치 우선, 급수 표기만 다른 경우까지만 허용 */
function matchCourse(certName: string, courses: CourseRow[]): CourseRow | null {
  const key = norm(certName);
  if (!key) return null;
  const exact = courses.find((course) => norm(course.name) === key);
  if (exact) return exact;
  return (
    courses.find(
      (course) => norm(course.name).startsWith(key) || key.startsWith(norm(course.name)),
    ) ?? null
  );
}

export async function restoreLegacyRecordsForMember(memberId: string): Promise<void> {
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select("id, login_id, name, birth_date, phone")
    .eq("id", memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!member) return;

  /* ---------- 1) 옛 신청 건 찾기 (미연결 이관분만) ----------
     로그인ID(=생년월일 6자리)는 생일이 같은 다른 사람과 겹칠 수 있으므로
     반드시 이름까지 함께 일치할 때만 붙입니다. (아이디만으로 매칭하면 생일이 같은
     남의 이관 자격증신청이 통째로 딸려 오는 사고가 납니다.) */
  const { data: byLoginId } = await supabase
    .from("certificate_applications")
    .select("id, legacy_no, certificate_name, course_id, education_start_date, education_end_date, applied_at")
    .is("member_id", null)
    .not("legacy_no", "is", null)
    .is("deleted_at", null)
    .eq("member_login_id", member.login_id)
    .eq("applicant_name", member.name);

  let matched = (byLoginId ?? []) as LegacyApplication[];

  // 2순위 — 이름+생년월일+전화 모두 일치할 때만 (하나라도 없으면 시도하지 않음)
  if (matched.length === 0 && member.birth_date && member.phone) {
    const phoneDigits = digits(member.phone);
    if (phoneDigits.length >= 10) {
      const { data: byIdentity } = await supabase
        .from("certificate_applications")
        .select(
          "id, legacy_no, certificate_name, course_id, education_start_date, education_end_date, applied_at, phone",
        )
        .is("member_id", null)
        .not("legacy_no", "is", null)
        .is("deleted_at", null)
        .eq("applicant_name", member.name)
        .eq("birth_date", member.birth_date);

      matched = ((byIdentity ?? []) as (LegacyApplication & { phone: string | null })[]).filter(
        (row) => digits(row.phone ?? "") === phoneDigits,
      );
    }
  }

  if (matched.length === 0) return;

  /* ---------- 2) 신청 건을 새 계정에 연결 ---------- */
  await supabase
    .from("certificate_applications")
    .update({ member_id: member.id })
    .in(
      "id",
      matched.map((row) => row.id),
    );

  /* ---------- 3) 과정별 수강완료 기록 생성 ---------- */
  const { data: courseRows } = await supabase
    .from("courses")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null);
  const courses = (courseRows ?? []) as CourseRow[];

  for (const application of matched) {
    const course = application.course_id
      ? (courses.find((row) => row.id === application.course_id) ?? null)
      : matchCourse(application.certificate_name, courses);
    if (!course) continue; // 과정을 못 찾으면 신청 건 연결까지만 (수동 처리 대상)

    // 신청 건에 과정 연결이 비어 있으면 채워 둡니다
    if (!application.course_id) {
      await supabase
        .from("certificate_applications")
        .update({ course_id: course.id })
        .eq("id", application.id);
    }

    // 이미 같은 과정 수강 기록이 있으면 만들지 않습니다
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("member_id", member.id)
      .eq("course_id", course.id)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) continue;

    const startDate = application.education_start_date ?? application.applied_at;
    const endDate =
      application.education_end_date ??
      new Date(new Date(`${startDate}T00:00:00`).getTime() + 42 * 86_400_000)
        .toISOString()
        .slice(0, 10);

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .insert({
        member_id: member.id,
        course_id: course.id,
        start_date: startDate,
        end_date: endDate,
        status: "confirmed",
        payment_status: "paid",
        application_date: startDate,
        confirmed_at: new Date().toISOString(),
        memo: `옛 시스템 수강 이력 자동 복원 (이관 신청 ${application.legacy_no}번)`,
      })
      .select("id")
      .single();

    if (enrollmentError || !enrollment) continue;

    // 게시된 전 차시를 학습완료(100%)로 — 옛 시스템에서 이미 수료한 과정입니다
    const { data: sessionRows } = await supabase
      .from("course_lectures")
      .select("id, sessions:lecture_sessions ( id )")
      .eq("course_id", course.id)
      .eq("is_published", true)
      .is("deleted_at", null)
      .is("sessions.deleted_at", null);

    const sessionIds = ((sessionRows ?? []) as { sessions: { id: string }[] }[])
      .flatMap((lecture) => lecture.sessions ?? [])
      .map((session) => session.id);

    if (sessionIds.length > 0) {
      await supabase.from("lecture_progress").insert(
        sessionIds.map((sessionId) => ({
          enrollment_id: enrollment.id,
          lecture_session_id: sessionId,
          video_progress_percent: 100,
          attendance_status: "completed",
          completed_at: new Date().toISOString(),
          last_position_seconds: 0,
        })),
      );
    }
  }
}

/** 가입 흐름에서 부르는 안전판 — 실패해도 가입은 계속 갑니다 */
export async function tryRestoreLegacyRecords(memberId: string): Promise<void> {
  try {
    await restoreLegacyRecordsForMember(memberId);
  } catch (error) {
    console.error("[legacy-restore] 옛 수강 이력 자동 복원 실패:", error);
  }
}
