import type { CourseDetailData, LecturePlanItem, ProfessorData } from "@/components/course-detail/types";
import {
  COURSE_DETAIL_SELECT,
  HERO_IMAGE_FALLBACK,
  LICENSE_INQUIRY_LABEL,
  LICENSE_INQUIRY_URL,
  PROFESSOR_EDUCATION_LABELS,
  PROFESSOR_PHOTO_FALLBACK,
  SHARED_CERTIFICATE_NOTE,
  SHARED_COURSE_GOAL,
  SHARED_ENROLLMENT_PERIOD,
  SHARED_FAQ,
  SHARED_LICENSE_DESCRIPTION,
  SHARED_PASS_CRITERIA,
  SHARED_REQUIREMENT_NOTES,
  SHARED_REQUIREMENTS,
} from "@/features/course-detail/constants";
import { createClient } from "@/lib/supabase/server";

type ProfessorRow = { name: string; bio: string[] | null; photo_url: string | null };
type AgencyRow = { name: string; ceo: string | null; phone: string | null; address: string | null };

type CourseRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  supervising_agency: string | null;
  study_method: string | null;
  lecture_time: string | null;
  lecture_format: string | null;
  price: number;
  regular_price: number;
  display_price: number;
  certificate_fee: number;
  is_deadline_soon: boolean;
  hero_description: string | null;
  hero_image_url: string | null;
  thumbnail_url: string | null;
  license_number: string | null;
  target_audience: string[] | null;
  career_paths: string[] | null;
  professor_name: string | null;
  professors: ProfessorRow | null;
  issuing_agencies: AgencyRow | null;
};

/** `[ 소속 ] 내용` 에서 라벨과 내용을 분리합니다. 라벨이 없으면 label은 빈 문자열입니다. */
function splitLabeled(line: string): { label: string; body: string } {
  const matched = /^\[\s*([^\]]+?)\s*\]\s*(.*)$/.exec(line);
  return matched ? { label: matched[1], body: matched[2].trim() } : { label: "", body: line.trim() };
}

/**
 * 교수 이력을 "소속"과 "학력 및 전공" 두 칸으로 나눕니다.
 *
 * 원본 데이터가 한 덩어리로 평문화돼 있어 줄 단위 복원은 불가능합니다.
 * 지금은 대괄호 라벨 단위가 곧 한 줄입니다.
 */
function buildProfessor(row: CourseRow): ProfessorData {
  const bio = row.professors?.bio ?? [];
  const intro: string[] = [];
  const education: string[] = [];

  for (const line of bio) {
    const { label, body } = splitLabeled(line);
    // `[Extensive experience ...]` 처럼 대괄호가 라벨이 아니라 본문 전체인 줄이 있습니다.
    // 이 경우 라벨을 그대로 본문으로 씁니다(빈 줄로 사라지지 않도록).
    const text = body || label;
    if (!text) continue;
    const isEducation = body
      ? PROFESSOR_EDUCATION_LABELS.some((keyword) => label.includes(keyword))
      : false;
    (isEducation ? education : intro).push(text);
  }

  return {
    courseLabel: row.name,
    name: row.professors?.name ?? row.professor_name ?? "담당 교수 미정",
    photo: row.professors?.photo_url ?? PROFESSOR_PHOTO_FALLBACK,
    intro,
    education,
  };
}

function mapToCourseDetail(row: CourseRow, lecturePlan: LecturePlanItem[]): CourseDetailData {
  const agency = row.issuing_agencies;
  const ministry = row.supervising_agency?.trim() || "안내 예정";
  const ctaLabel = row.display_price === 0 ? "무료수강신청" : "수강신청하기";

  return {
    slug: row.code,
    title: row.name,
    ministry,
    badges: row.is_deadline_soon ? [{ label: "마감임박", tone: "urgent" }] : [],
    originalPrice: row.regular_price,
    price: row.display_price,
    ctaLabel,

    info: {
      professor: row.professors?.name ?? row.professor_name ?? "안내 예정",
      format: row.lecture_format?.trim() || "안내 예정",
      method: row.study_method?.trim() || "안내 예정",
      duration: row.lecture_time?.trim() || "안내 예정",
      tuitionOriginal: row.regular_price,
      tuitionFinal: row.display_price,
      certFee: row.certificate_fee,
    },

    license: {
      number: row.license_number ?? "등록번호 준비 중",
      agency: agency?.name ?? "안내 예정",
      description: SHARED_LICENSE_DESCRIPTION,
      inquiryLabel: LICENSE_INQUIRY_LABEL,
      inquiryUrl: LICENSE_INQUIRY_URL,
    },

    organization: {
      name: agency?.name ?? "안내 예정",
      ceo: agency?.ceo ?? "-",
      contact: agency?.phone ?? "-",
      address: agency?.address ?? "-",
    },

    lecturePlan,

    description: {
      heading: `${row.name}란?`,
      body: row.hero_description ?? "",
      // 과정 전용 히어로 이미지가 없으면 수강신청 카드 썸네일을 그대로 씁니다.
      image: row.hero_image_url ?? row.thumbnail_url ?? HERO_IMAGE_FALLBACK,
      ministry,
    },

    goal: SHARED_COURSE_GOAL,
    // 활동유형은 별도 데이터가 없습니다. 진로 및 전망으로 갈음하며,
    // 비어 있으면 상세페이지에서 섹션 자체를 렌더링하지 않습니다.
    activities: [],
    targets: row.target_audience ?? [],
    career: { heading: "진로 및 전망", bullets: row.career_paths ?? [] },
    professor: buildProfessor(row),

    certificateSamples: [
      { label: "수 료 증", subLabel: agency?.name ?? "한국직업능력검정협회" },
      { label: "자 격 증", subLabel: row.name },
    ],
    certificateNote: SHARED_CERTIFICATE_NOTE,

    requirements: SHARED_REQUIREMENTS,
    requirementNotes: SHARED_REQUIREMENT_NOTES,
    faq: SHARED_FAQ,

    sticky: {
      title: row.name,
      professor: row.professors?.name ?? row.professor_name ?? "안내 예정",
      period: SHARED_ENROLLMENT_PERIOD,
      duration: row.lecture_time?.trim() || "안내 예정",
      method: row.study_method?.trim() || "안내 예정",
      passCriteria: SHARED_PASS_CRITERIA,
      originalPrice: row.regular_price,
      price: row.display_price,
      ctaLabel,
    },
  };
}

/** 커리큘럼. 게시된 강의의 차시를 순서대로 가져옵니다. */
async function fetchLecturePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
): Promise<LecturePlanItem[]> {
  const { data: lectures } = await supabase
    .from("course_lectures")
    .select("id")
    .eq("course_id", courseId)
    .is("deleted_at", null);

  const lectureIds = (lectures ?? []).map((lecture) => lecture.id);
  if (lectureIds.length === 0) return [];

  const { data: sessions } = await supabase
    .from("lecture_sessions")
    .select("session_order, title")
    .in("lecture_id", lectureIds)
    .is("deleted_at", null)
    .order("session_order", { ascending: true });

  return (sessions ?? []).map((session) => ({
    week: session.session_order,
    title: session.title,
  }));
}

/**
 * 과정 코드(`courses.code`)로 상세페이지 데이터를 만듭니다.
 * 없는 과정이면 null을 돌려주고 호출부에서 notFound() 처리합니다.
 */
export async function getCourseDetail(code: string): Promise<CourseDetailData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_DETAIL_SELECT)
    .eq("code", code)
    .is("deleted_at", null)
    .maybeSingle<CourseRow>();

  if (error || !data) return null;

  const lecturePlan = await fetchLecturePlan(supabase, data.id);
  return mapToCourseDetail(data, lecturePlan);
}

/** 상세페이지를 만들 과정 코드 목록. 숨김 과정은 제외합니다. */
export async function listCourseDetailCodes(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("code")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("code", { ascending: true });

  return (data ?? []).map((row) => row.code);
}
