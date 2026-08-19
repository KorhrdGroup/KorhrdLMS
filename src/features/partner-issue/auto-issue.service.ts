import { DEFAULT_ENROLLMENT_DURATION_DAYS } from "@/features/enrollment-catalog/constants";
import { CERTIFICATE_ISSUANCE_COST } from "@/features/certificate-applications/constants";
import { hashPassword } from "@/lib/shared/password";
import { todayInKst } from "@/lib/shared/kst-date";
import { createClient } from "@/lib/supabase/server";
import { tryRestoreLegacyRecords } from "@/features/members/services/legacy-restore.service";

/**
 * 한평생 오피스(학점연계 신청) → 한직훈 자동 발급.
 *
 * 오피스의 "한직훈 자동 발급 신청" 버튼이 /api/partner/auto-issue 로 호출합니다.
 * 한 번의 호출로 아래를 전부 만들어, **발급비 결제만 남은 상태**로 만듭니다.
 *
 *   1. 회원 — 아이디는 생년월일 6자리, 비밀번호 1234 (이미 있으면 재사용)
 *   2. 신청 자격증마다 수강신청(확정·결제완료)
 *   3. 진도 100% (전 차시 수강완료)
 *   4. 수료시험 100점 합격
 *   5. 자격증 발급신청 (미결제 상태)
 *
 * 같은 사람을 두 번 눌러도 안전합니다 — 이미 있는 것은 재사용하고 결과에 표시합니다.
 */

export type AutoIssueInput = {
  name: string;
  phone: string;
  /** 생년월일 6자리, 예: "800203" */
  birthDate: string;
  address?: string | null;
  addressDetail?: string | null;
  postalCode?: string | null;
  photoUrl?: string | null;
  /** 오피스에서 이미 결제(카드 10만원)된 건이면 true — 발급신청을 결제완료로 만들고
      결제관리(course_payments)에도 기록합니다. */
  paid?: boolean;
  /** 오피스에 적힌 신청 자격증 이름들 (예: "노인심리상담사1급") */
  certificates: string[];
};

export type AutoIssueCourseResult = {
  certificate: string;
  course: string | null;
  /** enrolled=이번에 처리, existed=이미 있던 것 재사용, unmatched=과정 못 찾음 */
  status: "enrolled" | "existed" | "unmatched";
  warnings: string[];
};

export type AutoIssueResult = {
  member: { loginId: string; password: string | null; created: boolean; name: string };
  courses: AutoIssueCourseResult[];
};

const FIXED_PASSWORD = "1234";

/** "노인심리상담사1급" ↔ "노인심리상담사" 처럼 급수·공백 표기만 다른 이름을 같게 봅니다 */
function norm(name: string): string {
  return name
    .normalize("NFC")
    .replace(/\s+/g, "")
    .replace(/&뷰티코디네이터$/, "")
    .replace(/[0-9]+급$/, "")
    .toLowerCase();
}

/** 오피스 표기 → LMS 과정명이 규칙으로 안 맞는 것들 (양쪽 이름이 다른 과정) */
const COURSE_ALIASES: Record<string, string> = {
  안전교육지도사: "안전관리사/안전교육지도사",
  안전관리사: "안전관리사/안전교육지도사",
  조향사: "조향사[향수디자이너]",
  향수디자이너: "조향사[향수디자이너]",
  아동공예지도자: "아동공예지도자 8종 공예과정",
  방과후수학지도사: "방과후수학지도사&스토리텔링수학지도사",
  스토리텔링수학지도사: "방과후수학지도사&스토리텔링수학지도사",
  진로적성상담사: "진로적성상담사 & 진로직업상담사",
  진로직업상담사: "진로적성상담사 & 진로직업상담사",
  병원코디네이터: "병원코디네이터1급",
  독서논술지도사: "독서논술지도사1급",
};

/** "800203" → "1980-02-03". 두 자리 연도는 오늘 기준으로 1900/2000년대를 고릅니다. */
function birthToIsoDate(birth6: string): string | null {
  const digits = birth6.replace(/\D/g, "");
  if (digits.length !== 6) return null;
  const yy = Number(digits.slice(0, 2));
  const mm = digits.slice(2, 4);
  const dd = digits.slice(4, 6);
  if (Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return null;
  const nowYY = new Date().getFullYear() % 100;
  const century = yy > nowYY ? "19" : "20";
  return `${century}${digits.slice(0, 2)}-${mm}-${dd}`;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return raw.trim();
}

type CourseRow = { id: string; name: string; default_duration_days: number | null };

function matchCourse(certName: string, courses: CourseRow[]): CourseRow | null {
  const key = norm(certName);
  if (!key) return null;

  const aliasTarget = COURSE_ALIASES[certName.normalize("NFC").replace(/\s+/g, "").replace(/[0-9]+급$/, "")];
  if (aliasTarget) {
    const hit = courses.find((c) => c.name.normalize("NFC") === aliasTarget);
    if (hit) return hit;
  }

  const exact = courses.find((c) => norm(c.name) === key);
  if (exact) return exact;

  // "미술심리상담사2급" 처럼 급수만 다른 경우까지 끌어옵니다
  return courses.find((c) => norm(c.name).startsWith(key) || key.startsWith(norm(c.name))) ?? null;
}

/**
 * 발급신청에 표시할 자격증명 — 오피스 표기(급수 포함)를 그대로 쓰고,
 * 급수가 없으면 과정명의 급수를, 그것도 없으면 "1급"을 붙입니다.
 * (예: 오피스 "노인심리상담사1급" → 그대로 / LMS 과정 "생활지원사" → "생활지원사1급")
 */
function certificateDisplayName(officeCertName: string, courseName: string): string {
  const base = officeCertName.trim() || courseName.trim();
  if (/[0-9]\s*급/.test(base)) return base;
  if (/[0-9]\s*급/.test(courseName)) return courseName.trim();
  return `${base}1급`;
}

export async function runAutoIssue(input: AutoIssueInput): Promise<AutoIssueResult> {
  const supabase = await createClient();

  const name = input.name.trim();
  const phone = formatPhone(input.phone);
  const birthDigits = input.birthDate.replace(/\D/g, "").slice(0, 6);
  const birthIso = birthToIsoDate(birthDigits);

  if (!name || birthDigits.length !== 6) {
    throw new Error("이름과 생년월일 6자리가 필요합니다.");
  }

  /* ---------- 1) 회원 찾기/만들기 ---------- */
  // 같은 휴대폰 번호의 기존 회원이 있으면 그 계정을 그대로 씁니다 (아이디가 달라도).
  const phoneDigits = phone.replace(/\D/g, "");
  let member: { id: string; login_id: string; name: string } | null = null;
  let memberCreated = false;

  if (phoneDigits.length >= 10) {
    const { data: byPhone } = await supabase
      .from("members")
      .select("id, login_id, name, phone")
      .is("deleted_at", null)
      .neq("status", "withdrawn")
      .or(`phone.eq.${phone},phone.eq.${phoneDigits}`);
    const hit = (byPhone ?? []).find(
      (m) => (m.phone ?? "").replace(/\D/g, "") === phoneDigits,
    );
    if (hit) member = hit;
  }

  if (!member) {
    // 아이디는 생년월일 6자리. 다른 사람이 쓰고 있으면 뒤에 1, 2… 를 붙입니다.
    for (let suffix = 0; suffix <= 9 && !member; suffix += 1) {
      const candidate = suffix === 0 ? birthDigits : `${birthDigits}${suffix}`;
      const { data: existing } = await supabase
        .from("members")
        .select("id, login_id, name")
        .eq("login_id", candidate)
        .is("deleted_at", null)
        .maybeSingle();

      if (!existing) {
        const { data: created, error } = await supabase
          .from("members")
          .insert({
            login_id: candidate,
            name,
            password_hash: hashPassword(FIXED_PASSWORD),
            phone,
            birth_date: birthIso,
            postal_code: input.postalCode?.trim() || null,
            address: input.address?.trim() || null,
            address_detail: input.addressDetail?.trim() || null,
            join_path: "학점연계 자동발급",
            status: "active",
          })
          .select("id, login_id, name")
          .single();
        if (error) throw new Error(`회원 생성 실패: ${error.message}`);
        member = created;
        memberCreated = true;
        // 옛 시스템 수강자라면 이관된 신청·수강 이력을 자동으로 붙입니다
        await tryRestoreLegacyRecords(created.id);
      } else if (existing.name === name) {
        member = existing; // 같은 사람이 같은 생년월일 아이디로 이미 가입돼 있음
      }
      // 이름이 다르면 다음 접미사로 넘어갑니다
    }
  }

  if (!member) {
    throw new Error("사용할 수 있는 아이디(생년월일)를 찾지 못했습니다.");
  }

  /* ---------- 2) 과정 매칭 ---------- */
  const { data: courseRows, error: courseError } = await supabase
    .from("courses")
    .select("id, name, default_duration_days")
    .is("deleted_at", null);
  if (courseError) throw new Error(courseError.message);
  const courses = (courseRows ?? []) as CourseRow[];

  const today = todayInKst();
  const end = new Date(`${today}T00:00:00+09:00`);
  end.setDate(end.getDate() + DEFAULT_ENROLLMENT_DURATION_DAYS);
  const endDate = end.toISOString().slice(0, 10);

  const results: AutoIssueCourseResult[] = [];

  for (const certName of input.certificates.map((c) => c.trim()).filter(Boolean)) {
    const course = matchCourse(certName, courses);
    if (!course) {
      results.push({ certificate: certName, course: null, status: "unmatched", warnings: ["과정을 찾지 못했습니다 — 직접 처리해주세요"] });
      continue;
    }

    const warnings: string[] = [];

    /* ---------- 3) 수강신청 ---------- */
    const { data: existingEnroll } = await supabase
      .from("enrollments")
      .select("id")
      .eq("member_id", member.id)
      .eq("course_id", course.id)
      .is("deleted_at", null)
      .neq("status", "canceled")
      .maybeSingle();

    let enrollmentId = existingEnroll?.id as string | undefined;
    const existed = Boolean(enrollmentId);

    if (!enrollmentId) {
      const { data: created, error } = await supabase
        .from("enrollments")
        .insert({
          member_id: member.id,
          course_id: course.id,
          start_date: today,
          end_date: endDate,
          status: "confirmed",
          payment_status: "paid",
          application_date: today,
          confirmed_at: new Date().toISOString(),
          memo: "학점연계 자동발급 (오피스)",
        })
        .select("id")
        .single();
      if (error) {
        results.push({ certificate: certName, course: course.name, status: "unmatched", warnings: [`수강신청 실패: ${error.message}`] });
        continue;
      }
      enrollmentId = created.id;
    }

    /* ---------- 4) 진도 100% ---------- */
    const { data: sessions } = await supabase
      .from("lecture_sessions")
      .select("id, lecture:course_lectures!inner ( course_id )")
      .eq("lecture.course_id", course.id)
      .is("deleted_at", null);

    const sessionIds = ((sessions ?? []) as unknown as { id: string }[]).map((s) => s.id);
    if (sessionIds.length === 0) {
      warnings.push("차시가 없어 진도율을 채우지 못했습니다");
    } else {
      const { error } = await supabase.from("lecture_progress").upsert(
        sessionIds.map((sessionId) => ({
          enrollment_id: enrollmentId!,
          lecture_session_id: sessionId,
          video_progress_percent: 100,
          attendance_status: "completed" as const,
          completed_at: new Date().toISOString(),
        })),
        { onConflict: "enrollment_id,lecture_session_id" },
      );
      if (error) warnings.push(`진도 반영 실패: ${error.message}`);
    }

    /* ---------- 5) 수료시험 100점 ---------- */
    const { data: finalExam } = await supabase
      .from("exams")
      .select("id")
      .eq("course_id", course.id)
      .eq("exam_kind", "final_exam")
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (!finalExam) {
      warnings.push("수료시험이 없어 합격 처리를 못했습니다 (시험 등록 필요)");
    } else {
      const { data: existingSubmission } = await supabase
        .from("exam_submissions")
        .select("id")
        .eq("enrollment_id", enrollmentId!)
        .eq("exam_id", finalExam.id)
        .maybeSingle();

      const submission = {
        score: 100,
        total_score: 100,
        is_passed: true,
        submitted_at: new Date().toISOString(),
      };
      const { error } = existingSubmission
        ? await supabase.from("exam_submissions").update(submission).eq("id", existingSubmission.id)
        : await supabase.from("exam_submissions").insert({
            enrollment_id: enrollmentId!,
            exam_id: finalExam.id,
            answers: {},
            ...submission,
          });
      if (error) warnings.push(`시험 반영 실패: ${error.message}`);
    }

    /* ---------- 6) 자격증 발급신청 ----------
       오피스에서 이미 결제(카드 10만원)하고 넘어온 건은 결제완료로 만들고,
       아니면 미결제로 둡니다. */
    const paid = Boolean(input.paid);
    const { data: existingApp } = await supabase
      .from("certificate_applications")
      .select("id, payment_status")
      .eq("member_id", member.id)
      .eq("course_id", course.id)
      .is("deleted_at", null)
      .maybeSingle();

    let applicationId = existingApp?.id as string | undefined;

    if (!existingApp) {
      const { data: createdApp, error } = await supabase
        .from("certificate_applications")
        .insert({
          member_id: member.id,
          course_id: course.id,
          certificate_kind: "course_completion",
          certificate_name: certificateDisplayName(certName, course.name),
          member_login_id: member.login_id,
          applicant_name: name,
          birth_date: birthIso,
          phone,
          postal_code: input.postalCode?.trim() || null,
          address: input.address?.trim() || null,
          address_detail: input.addressDetail?.trim() || null,
          photo_url: input.photoUrl?.trim() || null,
          // 오피스에서 사진 없이 넘어온 건은 "사진없이 발급"을 기본 체크합니다
          issue_without_photo: !(input.photoUrl?.trim()),
          issuance_cost: CERTIFICATE_ISSUANCE_COST,
          actual_payment_amount: CERTIFICATE_ISSUANCE_COST,
          payment_method: paid ? ("card" as const) : null,
          payment_status: paid ? ("paid" as const) : ("unpaid" as const),
          paid_at: paid ? new Date().toISOString() : null,
          delivery_status: "pending",
          memo: "학점연계 자동발급 (오피스)",
          applied_at: today,
        })
        .select("id")
        .single();
      if (error) warnings.push(`발급신청 생성 실패: ${error.message}`);
      applicationId = createdApp?.id;
    } else if (paid && existingApp.payment_status === "unpaid") {
      // 이미 만들어 둔 미결제 신청이 있으면 결제완료로 올립니다
      const { error } = await supabase
        .from("certificate_applications")
        .update({ payment_status: "paid", payment_method: "card", paid_at: new Date().toISOString() })
        .eq("id", existingApp.id);
      if (error) warnings.push(`결제완료 처리 실패: ${error.message}`);
    }

    /* 결제완료 건은 결제관리(course_payments)에도 기록합니다 — 어드민 수기 확인과
       같은 규칙(pg_order_id = cert-<신청id>)이라 중복 없이 한 건만 유지됩니다. */
    if (paid && applicationId) {
      const orderId = `cert-${applicationId}`;
      const { data: existingPayment } = await supabase
        .from("course_payments")
        .select("id")
        .eq("pg_order_id", orderId)
        .is("deleted_at", null)
        .maybeSingle();

      if (!existingPayment) {
        const { error } = await supabase.from("course_payments").insert({
          member_id: member.id,
          course_id: course.id,
          amount: CERTIFICATE_ISSUANCE_COST,
          payment_method: "card",
          status: "paid",
          payment_date: today,
          product_name: `${course.name} 자격증 발급비`,
          pg_order_id: orderId,
          approved_at: new Date().toISOString(),
          memo: "자격증 발급비 (학점연계 자동발급, 오피스 카드결제)",
        });
        if (error) warnings.push(`결제관리 기록 실패: ${error.message}`);
      }
    }

    results.push({
      certificate: certName,
      course: course.name,
      status: existed ? "existed" : "enrolled",
      warnings,
    });
  }

  return {
    member: {
      loginId: member.login_id,
      // 새로 만들었을 때만 비밀번호를 알려줍니다 — 기존 계정 비밀번호는 바꾸지 않습니다.
      password: memberCreated ? FIXED_PASSWORD : null,
      created: memberCreated,
      name: member.name,
    },
    courses: results,
  };
}
