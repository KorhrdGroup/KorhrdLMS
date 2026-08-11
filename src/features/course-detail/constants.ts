import type { FaqItemData, RequirementStat } from "@/components/course-detail/types";

/**
 * 상세페이지 20개 블록 중 과정마다 달라지는 것은 6개 블록뿐입니다.
 * 나머지 공통 문구를 여기에 모읍니다. 자세한 분리 기준은
 * `docs/course-detail-template-spec.md` 를 참고하세요.
 */

export const COURSE_DETAIL_SELECT = `
  id, code, name, status,
  supervising_agency, study_method, lecture_time, lecture_format,
  price, regular_price, display_price, certificate_fee, is_deadline_soon,
  hero_description, hero_image_url, thumbnail_url, license_number,
  target_audience, career_paths,
  professor_name,
  professors:professor_id ( name, bio, photo_url ),
  issuing_agencies:issuing_agency_id ( name, ceo, phone, address )
` as const;

/** 전 과정 동일한 강좌 목표 문구. 과정별로 다르게 갈 경우 courses에 컬럼을 추가하세요. */
export const SHARED_COURSE_GOAL =
  "지식을 학습하고, 역량을 함양하는 것을 목표로 합니다. 본 강좌는 핵심 개념에 대한 이해를 바탕으로, " +
  "실무 능력을 배양하는 데 초점을 맞춥니다. 수강생들은 이 강좌를 통해 특정 이론의 활용법을 익히고, " +
  "문제 해결 능력을 기를 수 있습니다.";

export const SHARED_LICENSE_DESCRIPTION =
  "본 자격증은 한국직업능력연구원에 정식으로 등록되었으며, 발급협회 규정에 따라 자격관리 및 " +
  "자격증 발급이 이루어지고 있음을 알려드립니다.";

export const LICENSE_INQUIRY_LABEL = "민간자격 조회 바로가기";
export const LICENSE_INQUIRY_URL = "https://www.pqi.or.kr";

export const SHARED_CERTIFICATE_NOTE =
  "위 시안은 예시이며 자격증은 카드형 자격증 또는 상장형 자격증이 발급됩니다.";

/** 합격/수료 기준은 grade-calculator의 실제 판정 규칙과 같은 값입니다. */
export const SHARED_PASS_CRITERIA = "출석률 60% 이상, 시험 60점 이상";
export const SHARED_ENROLLMENT_PERIOD = "신청일로부터 6주";

export const SHARED_REQUIREMENTS: RequirementStat[] = [
  {
    id: "r1",
    category: "온라인 강의",
    visual: "donut",
    percent: 60,
    label: "전체 진도율(출석률)",
    caption: "60% 이상",
  },
  {
    id: "r2",
    category: "온라인 시험성적",
    visual: "donut",
    percent: 60,
    label: "100점 기준",
    caption: "평균 60점 이상",
  },
  {
    id: "r3",
    category: "수료 기준",
    visual: "bar",
    bars: [
      { label: "진도율", percent: 40 },
      { label: "시험", percent: 60 },
    ],
    caption: "진도율(출석률) 40점 · 시험 60점",
  },
  {
    id: "r4",
    category: "수료 기간",
    visual: "flow",
    from: "1주차",
    to: "6주차",
    caption: "수강시작 후 6주 과정",
  },
];

export const SHARED_REQUIREMENT_NOTES = [
  "진도율(출석률) 60% 이상이면 시험에 응시할 수 있습니다.",
  "수료는 총점 60점 이상 · 진도율 60% 이상 · 시험 60점 이상을 모두 만족해야 합니다.",
  "총점은 진도율 40% + 시험 60%로 계산됩니다.",
];

export const SHARED_FAQ: FaqItemData[] = [
  {
    question: "나이가 많아도 상관없나요?",
    answer:
      "네, 실제로 경력단절이나 노후 준비를 위해 40~60대 수강생분들의 수강 및 성공기가 꾸준히 이어지고 있습니다.",
  },
  {
    question: "수업은 매일 들어야 하나요?",
    answer:
      "수업은 녹강이기 때문에 편하신 시간대에 맞춰서 자유롭게 들어주시면 됩니다. 하루에 하나씩, 주말에 몰아서 수강 모두 가능합니다.",
  },
  {
    question: "컴퓨터를 잘 못해도 가능한가요?",
    answer:
      "네, 모바일로도 수강 가능하며 처음 온라인 강의를 접하시는 분들도 쉽게 따라오실 수 있도록 구성되어 있습니다. 어려우실 경우 본원으로 전화문의 주시면 자세히 안내 도와드리겠습니다.",
  },
  {
    question: "시험은 어렵지 않나요?",
    answer:
      "처음 준비하시는 분들도 부담 없이 응시하실 수 있으며, 온라인으로 진행되며 기출문제에서 대부분 확인 가능합니다. 추가로 응시료도 발생하지 않아 재시험도 가능하오니 걱정하지 않으셔도 됩니다.",
  },
  {
    question: "자격증은 이력서에 기재 가능한가요?",
    answer:
      "한국직업능력연구원에 정식으로 등록된 자격증이기 때문에, 자격증 취득 후 이력서 및 자기소개서 등에 기재 가능합니다.",
  },
  {
    question: "자격증은 나중에 갱신해야 되나요?",
    answer: "아닙니다. 자격증은 갱신할 필요 없는 평생자격증입니다.",
  },
];

/** 교수 사진이 없을 때 쓰는 대체 이미지. 56명 중 22명만 사진이 확보돼 있습니다. */
export const PROFESSOR_PHOTO_FALLBACK = "/images/home/license-new01.jpg";

/**
 * 히어로 배경 우선순위: courses.hero_image_url → courses.thumbnail_url(수강신청 카드
 * 썸네일) → 공용 샘플. 과정 전용 히어로 이미지가 아직 없어 썸네일을 재사용합니다.
 */
export const HERO_IMAGE_FALLBACK = "/course-detail/hero-course-sample.jpg";

/**
 * 교수 이력(professors.bio)은 `[ 소속 ] ...` 형태의 라벨이 앞에 붙어 있습니다.
 * 상세페이지는 이를 "소속"과 "학력 및 전공" 두 칸으로 나눠 보여줍니다.
 */
export const PROFESSOR_EDUCATION_LABELS = ["학력", "전공", "자격", "수상", "저서"];

/** 무료수강 이벤트 종료 일시(ISO). 하단 고정 CTA 카운트다운에 씁니다. */
export const ENROLL_EVENT_DEADLINE = "2026-12-31T23:59:59";

/**
 * 주무부처 로고 파일 slug.
 *
 * 원본 파일명이 한글이라 macOS(NFD)와 URL(NFC) 정규화가 어긋나 404가 나기 쉽습니다.
 * `public/course-detail/ministry-logo/` 에서 ASCII 파일명으로 바꿔 두고 여기서 매핑합니다.
 *
 * 이 폴더에 없는 부처는 목록 화면이 쓰는 SVG(public/ministry-logo/)로 잇습니다
 * — 아래 MINISTRY_LOGO_SVG 참고. 양쪽 다 없을 때만 부처명을 글자로 표시합니다.
 */
export const MINISTRY_LOGO_SLUG: Record<string, string> = {
  과학기술정보통신부: "msit",
  교육부: "moe",
  농림축산식품부: "mafra",
  문화체육관광부: "mcst",
  법무부: "moj",
  보건복지부: "mohw",
  산림청: "forest",
  산업통상자원부: "motie",
  식품의약품안전처: "mfds",
  여성가족부: "mogef",
  환경부: "me",

  // 운영 사이트(korhrd.co.kr) 표기를 그대로 쓰는 과정들. 정식 명칭과 달라도
  // 로고는 같은 부처 것을 써야 하므로 별칭으로 함께 매핑합니다.
  산업통상부: "motie", // → 산업통상자원부
  식품의약품안전처부: "mfds", // → 식품의약품안전처
  "교육부/고용노동부": "moe", // 두 부처 공동 소관, 로고는 교육부로 표시
};

/**
 * 이 화면의 PNG 폴더에는 없지만 목록 화면(public/ministry-logo/)에는 있는 부처.
 * 값은 그 폴더의 파일명입니다 — `{파일명}-white.svg` · `{파일명}-black.svg`.
 *
 * 크기는 CSS 가 잡으므로(.dhero__gov img{height:32px} · .dcert__logo--gov img{height:62px})
 * PNG 든 SVG 든 같게 나옵니다.
 * 이름이 파일명과 다른 과정은 목록 쪽 GovMark 와 같은 별칭을 씁니다.
 */
export const MINISTRY_LOGO_SVG: Record<string, string> = {
  경찰청: "경찰청",
  국토교통부: "국토교통부",
  행정안전부: "행정안전부",
  중소기업벤처부: "중소벤처기업부", // 운영 사이트 표기 → 정식 명칭
  질병관리부: "질병관리청", //         운영 사이트 표기 → 정식 명칭
};

export function ministryLogo(agency: string | null, tone: "white" | "black"): string | null {
  if (!agency) return null;
  const name = agency.trim();

  const slug = MINISTRY_LOGO_SLUG[name];
  if (slug) return `/course-detail/ministry-logo/${slug}-${tone}@3x.png`;

  const svg = MINISTRY_LOGO_SVG[name];
  if (svg) return `/ministry-logo/${encodeURIComponent(svg)}-${tone}.svg`;

  return null;
}

/** 상세페이지 전용 정적 에셋 경로. index.html의 assets/ 를 그대로 옮겨둔 것입니다. */
export const ASSET = (file: string) => `/course-detail/${file}`;
