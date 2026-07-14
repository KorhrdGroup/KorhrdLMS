import { ENROLLMENT_COURSES, type EnrollmentCourse } from "@/components/enrollment/data/enrollment-data";
import type { CourseBadge, CourseDetailData } from "@/components/course-detail/types";

const SHARED_ORGANIZATION = {
  name: "한국직업능력검정협회",
  ceo: "강희수",
  contact: "02)465-9568",
  address: "서울시 강서구 초록마을로2길26,2층",
};

const SHARED_LECTURE_PLAN = [
  { week: 1, title: "과정 개요와 배경 지식 이해" },
  { week: 2, title: "핵심 이론과 기본 개념 정리" },
  { week: 3, title: "실무 적용을 위한 사례 분석" },
  { week: 4, title: "현장 리스크 관리와 대응 방안" },
  { week: 5, title: "안전하고 체계적인 업무 프로세스 조성" },
  { week: 6, title: "직무 수행을 위한 핵심 역량 강화" },
  { week: 7, title: "전문성 확보를 위한 심화 학습" },
  { week: 8, title: "윤리와 책임을 갖춘 실무 자세 확립" },
  { week: 9, title: "커뮤니케이션과 협업 역량 향상" },
  { week: 10, title: "직무 트렌드와 미래 전망" },
  { week: 11, title: "리스크 관리와 신뢰도 제고 방안" },
  { week: 12, title: "지속 가능한 성장을 위한 대응 전략" },
  { week: 13, title: "우수 사례를 통한 현장 적용 연구" },
  { week: 14, title: "관련 산업 대표 사례 분석" },
  { week: 15, title: "성과 관리와 핵심 전략 수립" },
  { week: 16, title: "주요 이슈와 대응 사례 연구" },
  { week: 17, title: "지속가능한 성장을 위한 협업 사례" },
  { week: 18, title: "실무 프로젝트 사례 연구 1" },
  { week: 19, title: "실무 프로젝트 사례 연구 2" },
  { week: 20, title: "실무 프로젝트 사례 연구 3" },
];

const SHARED_ACTIVITIES = [
  { id: "a1", order: "활동유형 06", title: "기업, 공공기관 대상 전문 교육 및 워크숍 진행" },
  { id: "a2", order: "활동유형 07", title: "현장 역량 향상을 위한 전략 컨설팅" },
  { id: "a3", order: "활동유형 01", title: "전문 기술 습득을 목표로 하는 분" },
  { id: "a4", order: "활동유형 02", title: "관련 기관 및 컨설팅 업체 취업 준비" },
  { id: "a5", order: "활동유형 03", title: "보고서 검토 및 자문 업무 수행" },
];

const SHARED_TARGETS = [
  "퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분",
  "사회경력자로서 새로운 분야에 도전하고자 하시는 분",
  "임직원 대상 직무 역량 개선 및 실천 캠페인 운영",
  "정부, 지자체의 관련 정책 사업에 참여하고자 하는 분",
  "공공기관 평가 수행 및 평가기준 자문 업무에 관심 있는 분",
  "지역사회 관련 제도·정책 연구에 참여하고자 하는 분",
  "관련 보고서 및 문서 작성 역량을 기르고 싶은 분",
  "관련 기관 및 전문가 그룹과 협업하고자 하는 분",
];

const SHARED_CAREER = {
  heading: "진로 및 전망",
  bullets: [
    "관련 프로그램을 운영하는 교육서비스 제공기업 강사",
    "표준 기반 평가·인증 자료 관리 담당자",
    "컨설팅 회사, 관련 협회, 인증평가기관 취업",
    "관련 시민단체, NGO 및 재단 활동가",
    "전문 교육강사, 실무 전산 강연가",
    "프리랜서 진단 및 평가 컨설턴트",
    "프리랜서 전문가, 실무 진단사",
    "관련 교육 강연, 직무연수, 기관 워크숍 강사",
    "관련 콘텐츠 제작, 연구 분야 전문가",
  ],
};

const SHARED_CERTIFICATE_NOTE = "위 시안은 예시이며 자격증은 카드형 자격증 또는 상장형 자격증이 발급됩니다.";

const SHARED_REQUIREMENTS = [
  {
    id: "r1",
    category: "온라인 강의",
    visual: "donut" as const,
    percent: 60,
    label: "전체 진도율(출석률)",
    caption: "60% 이상",
  },
  {
    id: "r2",
    category: "온라인 시험성적",
    visual: "donut" as const,
    percent: 60,
    label: "100점 기준",
    caption: "평균 60점 이상",
  },
  {
    id: "r3",
    category: "수료 기준",
    visual: "bar" as const,
    bars: [
      { label: "진도율", percent: 40 },
      { label: "시험", percent: 60 },
    ],
    caption: "진도율(출석률) 40점 · 시험 60점",
  },
  {
    id: "r4",
    category: "수료 기간",
    visual: "flow" as const,
    from: "1주차",
    to: "6주차",
    caption: "수강시작 후 6주 과정",
  },
];

const SHARED_REQUIREMENT_NOTES = [
  "진도율(출석률)과 수강기간 6주 이후 두 가지 조건 만족 시 자격증 발급",
  "진도율(출석률) 종점 40점은 60% 이상 시 출석률로 적용됩니다.",
  "과제는 필수 제출 사항이 아닙니다.",
];

const SHARED_FAQ = [
  {
    question: "자격증 신청 참고사항",
    answer:
      "자격증 발송은 전달의 4회 발송 됩니다.(매주 금요일 발송 2일이내 수령가능)\n자격증은 택배로 발송됩니다.\n자격증 발급비용은 개별부담이며 종이류의 엽서,택배비 모두 포함입니다.\n수료증 발급은 별도로 하지 않으며 성적표는 [학습강의실]-[취소 완료된 강좌]에서 확인 가능합니다.",
  },
  { question: "자격증 신청 및 비용 납부", answer: "자격증 신청 및 비용 납부에 대한 상세 안내입니다." },
  { question: "자격증 발급 소요기간", answer: "자격증 발급까지 통상 2~3주가 소요됩니다." },
  { question: "자격증 발급 진행 확인", answer: "학습강의실 내 마이페이지에서 진행 상황을 확인할 수 있습니다." },
  { question: "소비자 알림사항", answer: "본 자격은 국가공인 자격이 아닌 민간자격입니다." },
];

const PROFESSOR_PHOTO_POOL = [
  "/images/home/license-hot02.jpg",
  "/images/home/license-hot04.jpg",
  "/images/home/license-new01.jpg",
];

const BADGE_TONE_MAP: Record<EnrollmentCourse["badge"]["tone"], CourseBadge["tone"]> = {
  urgent: "urgent",
  deal: "urgent",
  new: "new",
};

function buildCourseDetail(course: EnrollmentCourse, index: number): CourseDetailData {
  const fullTitle = `${course.title}${course.suffix}`;
  const badges: CourseBadge[] = [
    { label: "추천과정", tone: "recommend" },
    { label: course.price === 0 ? "무료수강" : course.badge.label, tone: BADGE_TONE_MAP[course.badge.tone] },
  ];

  return {
    slug: course.slug,
    title: fullTitle,
    ministry: course.ministry,
    badges,
    originalPrice: course.originalPrice,
    price: course.price,
    ctaLabel: course.price === 0 ? "무료수강신청" : "수강신청하기",

    info: {
      professor: course.professor,
      format: "이론 중심, 사례 안내",
      method: course.method,
      duration: course.duration,
      tuitionOriginal: course.originalPrice,
      tuitionFinal: course.price,
      certFee: 100000,
    },

    license: {
      number: `2024-${String(1000 + index).padStart(6, "0")}`,
      agency: course.agency,
      description:
        "본 자격증은 한국직업능력연구원에 정식으로 등록되었으며, 발급협회 규정에 따라 자격관리 및 자격증 발급이 이루어지고 있음을 알려드립니다.",
      inquiryLabel: "민간자격 조회 바로가기",
      inquiryUrl: "https://www.pqi.or.kr",
    },

    organization: SHARED_ORGANIZATION,
    lecturePlan: SHARED_LECTURE_PLAN,

    description: {
      heading: `${course.title}란?`,
      body: `${course.title}는 ${course.ministry} 소관 분야의 전문성을 인정받는 민간자격 과정으로, 이론 학습과 실무 사례를 통해 현장에서 곧바로 활용할 수 있는 역량을 기르는 것을 목표로 합니다. 체계적인 커리큘럼을 통해 관련 분야의 핵심 지식을 습득하고, 실전 능력을 갖춘 전문가로 성장할 수 있도록 구성되었습니다.`,
      image: course.image,
      ministry: course.ministry,
    },

    goal:
      "지식을 학습하고, 역량을 함양하는 것을 목표로 합니다. 본 강좌는 핵심 개념에 대한 이해를 바탕으로, 실무 능력을 배양하는 데 초점을 맞춥니다. 수강생들은 이 강좌를 통해 이론과 실용성을 익히고, 문제 해결 능력을 기를 수 있습니다. 수강 대상이 핵심 역량을 습득하여 궁극적인 목표를 달성할 수 있도록 돕습니다.",

    activities: SHARED_ACTIVITIES,
    targets: SHARED_TARGETS,
    career: SHARED_CAREER,

    professor: {
      courseLabel: fullTitle,
      name: `${course.professor}님`,
      photo: PROFESSOR_PHOTO_POOL[index % PROFESSOR_PHOTO_POOL.length],
      intro: ["홍양대학교 초빙교수 8년 역임", "現 예듀윌 전임강사"],
      education: ["산업분야 사업자문 위원", "홍양대학교 문학,역사,철학 석사"],
    },

    certificateSamples: [
      { label: "수 료 증", subLabel: SHARED_ORGANIZATION.name },
      { label: "자 격 증", subLabel: fullTitle },
    ],
    certificateNote: SHARED_CERTIFICATE_NOTE,

    requirements: SHARED_REQUIREMENTS,
    requirementNotes: SHARED_REQUIREMENT_NOTES,
    faq: SHARED_FAQ,

    sticky: {
      title: fullTitle,
      professor: course.professor,
      period: "신청일로부터 6주",
      duration: course.duration,
      method: course.method,
      passCriteria: "출석률 60% 이상, 시험 60점 이상",
      originalPrice: course.originalPrice,
      price: course.price,
      ctaLabel: course.price === 0 ? "무료수강신청" : "수강신청하기",
    },
  };
}

export const COURSE_DETAIL_MOCK: Record<string, CourseDetailData> = Object.fromEntries(
  ENROLLMENT_COURSES.map((course, index) => [course.slug, buildCourseDetail(course, index)]),
);

const DEFAULT_SLUG = ENROLLMENT_COURSES[0].slug;

export function getCourseDetail(slug: string): CourseDetailData {
  return COURSE_DETAIL_MOCK[slug] ?? COURSE_DETAIL_MOCK[DEFAULT_SLUG];
}
