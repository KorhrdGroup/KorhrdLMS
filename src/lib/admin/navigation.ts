import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminModule =
  | "members"
  | "courses"
  | "evaluation"
  | "payments"
  | "boards"
  | "licenses"
  | "statistics"
  | "operations";

export type AdminNavChild = {
  label: string;
  href: string;
  /** false 인 경우 아직 구현되지 않은 화면이며, 클릭 시 "준비중" 안내 페이지로 이동합니다. */
  implemented?: boolean;
};

export type AdminNavGroup = {
  label: string;
  icon: LucideIcon;
  module: AdminModule;
  children: AdminNavChild[];
};

/**
 * 좌측 대메뉴(사이드바) — 각 그룹은 상단 소메뉴 탭으로 하위 메뉴를 노출합니다.
 * 민간자격증 LMS 운영에 맞춰 "과정관리"와 "강의관리"를 하나의 "과정관리"로 통합했습니다
 * (차시관리/시험관리는 실제 기능은 그대로 두고 과정관리 하위 메뉴로만 재배치).
 * 기존 라우트는 최대한 유지하고, 메뉴 구조/명칭만 재정리했습니다.
 *
 * "과정관리"와 "평가관리"는 하위 메뉴 href가 하나도 겹치지 않도록 완전히 분리되어
 * 있습니다(같은 href를 공유하면 resolveActiveAdminNav가 먼저 등장하는 그룹만 활성
 * 처리해 다른 그룹 클릭 시에도 그 그룹이 활성화되는 문제가 생깁니다).
 * - 과정관리: 과정목록 / 차시관리 / 시험관리(시험 생성·수정·문제관리)
 * - 평가관리: 성적관리(학생 시험 응시 결과·점수·재시험 관리, /admin/exam-results)
 *
 * "수강관리" 대메뉴는 더 이상 운영하지 않습니다. 민간자격증 LMS는 수강반(classes)을
 * 별도로 운영하지 않고 프론트 수강신청 즉시 enrollments가 confirmed로 생성되므로,
 * 관리자가 별도의 수강현황/수강신청/반관리 화면을 볼 필요가 없습니다. 수강 관련 정보는
 * "회원관리 > 회원목록"의 "수강과정" 컬럼에서 확인합니다. 기존 라우트(/admin/enrollments,
 * /admin/enrollments/pending, /admin/enrollments/classes, /admin/enrollments/confirmed)와
 * 하위 서비스/컴포넌트, enrollments 데이터는 삭제하지 않았고, 각 페이지는 직접 접근 시
 * `/admin/members`로 redirect됩니다(해당 page.tsx 참고).
 *
 * "수료관리" 대메뉴도 더 이상 운영하지 않습니다. 민간자격증 LMS는 별도의 전자 수료증을
 * 발급하지 않고, 학생이 프론트 자격증발급신청(`/certificate/apply`)으로 신청한 실물
 * 자격증만 관리하면 되므로 "자격증신청" 화면만으로 충분합니다. 기존 수료증관리
 * 라우트(/admin/certificates)와 하위 서비스/컴포넌트(`completion-certificates`), DB
 * 데이터는 삭제하지 않았고, 직접 접근 시 `/admin/certificates/applications`로
 * redirect됩니다(해당 page.tsx 참고).
 *
 * "자격증관리" 대메뉴는 "자격증신청"으로 이름을 바꾸고 소메뉴는 "발급신청" 1개만
 * 남깁니다("승인관리"/"발급현황"은 같은 신청 목록 화면에서 상태를 함께 확인·관리하므로
 * 이미 제거되어 있었습니다). "선납결제"는 자격증 발급비를 미리 결제한 학생을 관리하는
 * 화면으로, 결제 관련 화면이라는 성격에 맞춰 "자격증신청"이 아닌 "결제관리" 하위로
 * 이동했습니다(`/admin/certificates/prepayments` → `/admin/payments/prepayments`,
 * 기존 URL은 직접 접근 시 redirect). 학생이 자격증발급신청을 하면 사용 가능한
 * 선납결제가 자동으로 연결되어 최종결제금액에 반영됩니다
 * (`certificate-application.service.ts` 참고). 관련 기능 코드는 이동하지 않고 그대로
 * `src/features/certificate-prepayments`에 위치하며, 라우트/메뉴만 결제관리로
 * 재배치했습니다.
 *
 * "결제관리" 소메뉴 중 아직 구현되지 않았던 "환불관리"/"쿠폰관리"/"할인관리"는
 * 제거했습니다(해당 라우트는 직접 접근 시 "전체결제"로 redirect). 기존 "결제목록"은
 * 이름만 "전체결제"로 바꿨고 화면/기능(구현 위치: `src/features/payments`,
 * URL: /admin/payments/subjects)은 그대로입니다.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "회원관리",
    icon: Users,
    module: "members",
    // 민간자격증 LMS는 회원을 프론트 회원가입으로만 생성합니다(백오피스 직접 등록 없음).
    // "회원등록"/"휴면회원"/"탈퇴회원" 소메뉴는 제거하고 "회원목록" 하나만 남깁니다.
    // status 기반 조회(dormant/withdrawn) 자체는 member-list 서비스에 그대로 남아있어
    // 필요 시 `/admin/members?status=dormant` 형태로 조회할 수 있습니다.
    children: [{ label: "회원목록", href: "/admin/members" }],
  },
  {
    label: "과정관리",
    icon: BookOpen,
    module: "courses",
    children: [
      { label: "과정목록", href: "/admin/courses" },
      { label: "카테고리관리", href: "/admin/courses/categories" },
      { label: "차시관리", href: "/admin/lectures" },
      { label: "시험관리", href: "/admin/exams" },
    ],
  },
  {
    label: "평가관리",
    icon: FileText,
    module: "evaluation",
    children: [{ label: "성적관리", href: "/admin/exam-results" }],
  },
  {
    label: "게시판관리",
    icon: LayoutGrid,
    module: "boards",
    children: [
      { label: "공지사항", href: "/admin/notices" },
      { label: "1:1 상담", href: "/admin/boards/consultation" },
      { label: "자유게시판", href: "/admin/boards/free" },
      { label: "자료실", href: "/admin/boards/resource" },
      { label: "FAQ", href: "/admin/boards/faq" },
    ],
  },
  {
    label: "자격증신청",
    icon: ShieldCheck,
    module: "licenses",
    children: [{ label: "발급신청", href: "/admin/certificates/applications" }],
  },
  {
    label: "결제관리",
    icon: CreditCard,
    module: "payments",
    children: [
      { label: "전체결제", href: "/admin/payments/subjects" },
      { label: "선납결제", href: "/admin/payments/prepayments" },
    ],
  },
  {
    label: "통계",
    icon: BarChart3,
    module: "statistics",
    children: [
      { label: "회원통계", href: "/admin/statistics/members", implemented: false },
      { label: "수강통계", href: "/admin/statistics/enrollments", implemented: false },
      { label: "시험통계", href: "/admin/statistics/exams", implemented: false },
      { label: "매출통계", href: "/admin/statistics/revenue", implemented: false },
      { label: "접속로그", href: "/admin/statistics/admin-access" },
    ],
  },
  {
    label: "운영관리",
    icon: Settings,
    module: "operations",
    children: [
      { label: "메시지센터", href: "/admin/others/message-center" },
      { label: "팝업관리", href: "/admin/others/notice-popups" },
      { label: "배너관리", href: "/admin/others/banners", implemented: false },
      { label: "시스템로그", href: "/admin/others/system-logs", implemented: false },
    ],
  },
];

export function getAdminNavGroupByModule(module: AdminModule) {
  return adminNavGroups.find((group) => group.module === module);
}

function hrefPathOnly(href: string) {
  const index = href.indexOf("?");
  return index === -1 ? href : href.slice(0, index);
}

/**
 * 현재 경로(pathname)를 기준으로 활성화할 그룹/하위 메뉴를 찾습니다.
 * 쿼리스트링은 비교에서 제외하고 경로만으로 판단하며(useSearchParams 없이 동작),
 * 같은 경로를 공유하는 하위 메뉴 중에서는 배열에 먼저 등장한 항목이 우선합니다.
 * 여러 하위 메뉴 경로 중 가장 구체적인(긴) 경로가 매치되면 그 항목을 활성으로 봅니다.
 */
export function resolveActiveAdminNav(pathname: string) {
  let best: { group: AdminNavGroup; child: AdminNavChild } | null = null;
  let bestScore = -1;

  for (const group of adminNavGroups) {
    for (const child of group.children) {
      const path = hrefPathOnly(child.href);
      const matches = pathname === path || pathname.startsWith(`${path}/`);

      if (!matches) {
        continue;
      }

      if (path.length > bestScore) {
        bestScore = path.length;
        best = { group, child };
      }
    }
  }

  return best;
}

export type AdminWidgetItem = {
  title: string;
  date?: string;
};
