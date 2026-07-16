import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  Brain,
  BookOpen,
  Coffee,
  CheckCircle2,
  Compass,
  Dog,
  Hammer,
  Headset,
  HeartHandshake,
  HelpCircle,
  Mic2,
  Monitor,
  Palette,
  Phone,
  PersonStanding,
  Rocket,
  School,
  Stethoscope,
  TrafficCone,
  UtensilsCrossed,
  Video,
} from "lucide-react";

export type HomeNavItem = { label: string; href: string };

export type HeroSlide = {
  id: string;
  image: string;
  alt: string;
  kicker: string;
  title: [string, string];
  ministry: string;
};

export type QuickMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

export type CategoryItem = { id: string; label: string; icon: LucideIcon };

export type CourseCardItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  ministry?: string;
};

export type NoticeItem = { id: string; title: string; date: string };

export type FaqItem = {
  id: string;
  question: string;
  links?: { label: string; href: string }[];
};

export type QuickLinkItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

export type PartnerLogo = { id: string; label: string };

export type FooterLink = { label: string; href: string; emphasis?: boolean };

export type FamilySite = { label: string; href: string };

export const HOME_NAV_ITEMS: HomeNavItem[] = [
  { label: "수강신청", href: "/enrollment" },
  { label: "자격증발급신청", href: "/certificate/apply" },
  { label: "공지사항", href: "/notice" },
  { label: "학습강의실", href: "/classroom" },
];

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: "/images/home/desk_frame2.png",
    alt: "심리상담사 1급 자격",
    kicker: "꾸준히 선택받는 자격증 1순위",
    title: ["심리상담사", "1급 자격"],
    ministry: "보건복지부",
  },
  {
    id: "2",
    image: "/images/home/desk_frame1.png",
    alt: "생활지원사 1급 자격",
    kicker: "가장 빠르게 취업하는 방법",
    title: ["생활지원사", "1급 자격"],
    ministry: "보건복지부",
  },
  {
    id: "3",
    image: "/images/home/desk_frame4.png",
    alt: "방과후 돌봄지도사",
    kicker: "아이와 함께 성장하는 시간",
    title: ["방과후", "돌봄지도사"],
    ministry: "교육부",
  },
  {
    id: "4",
    image: "/images/home/desk_frame5.png",
    alt: "바리스타 1급 자격",
    kicker: "나만의 커리어를 완성하다",
    title: ["바리스타", "1급 자격"],
    ministry: "교육부",
  },
  {
    id: "5",
    image: "/images/home/desk_frame3.png",
    alt: "병원동행매니저 1급",
    kicker: "믿을 수 있는 국가지정 자격증",
    title: ["병원동행", "매니저 1급"],
    ministry: "보건복지부",
  },
];

export const QUICK_MENU_ITEMS: QuickMenuItem[] = [
  { id: "q1", label: "1:1 상담", icon: Headset, href: "/support/qna" },
  { id: "q2", label: "전화상담", icon: Phone, href: "tel:0221359249" },
  { id: "q3", label: "수강신청", icon: Monitor, href: "/enrollment" },
  { id: "q4", label: "자격증신청", icon: Award, href: "/certificate/apply" },
];

export const COURSE_CATEGORIES: CategoryItem[] = [
  { id: "job", label: "취업과정", icon: Briefcase },
  { id: "silver", label: "실버과정", icon: PersonStanding },
  { id: "psychology", label: "심리과정", icon: Brain },
  { id: "afterschool", label: "방과후과정", icon: School },
  { id: "welfare", label: "복지과정", icon: HeartHandshake },
  { id: "cafe", label: "카페과정", icon: Coffee },
  { id: "safety", label: "안전과정", icon: TrafficCone },
  { id: "beauty", label: "뷰티과정", icon: Palette },
  { id: "hospital", label: "병원과정", icon: Stethoscope },
  { id: "personality", label: "인성교육과정", icon: BookOpen },
  { id: "instructor", label: "강사과정", icon: Mic2 },
  { id: "startup", label: "창업과정", icon: Rocket },
  { id: "pet", label: "반려과정", icon: Dog },
  { id: "craft", label: "공예과정", icon: Hammer },
  { id: "cooking", label: "요리과정", icon: UtensilsCrossed },
];

export const HOT_COURSES: CourseCardItem[] = [
  {
    id: "h1",
    title: "방과후학교지도사",
    category: "방과후 학교 전문가 과정",
    image: "/images/home/license-hot01.jpg",
  },
  {
    id: "h2",
    title: "아동미술심리상담사",
    category: "심리상담 전문가 과정",
    image: "/images/home/license-hot02.jpg",
  },
  {
    id: "h3",
    title: "다문화심리상담사1급",
    category: "심리상담전문가과정",
    image: "/images/home/license-hot03.jpg",
  },
  {
    id: "h4",
    title: "노인심리상담사 1급",
    category: "실기 진문가과정",
    image: "/images/home/license-hot04.jpg",
  },
];

export const NEW_COURSES: CourseCardItem[] = [
  {
    id: "n1",
    title: "SNS마케팅 전문가",
    category: "마케팅 전무 과정",
    image: "/images/home/license-new01.jpg",
  },
  {
    id: "n2",
    title: "진로적성상담사",
    category: "진로상담전문가 과정",
    image: "/images/home/license-new02.jpg",
  },
  {
    id: "n3",
    title: "바리스타",
    category: "커피 전문가 과정",
    image: "/images/home/license-new03.jpg",
  },
  {
    id: "n4",
    title: "메이크업코디네이터",
    category: "뷰티 전문가 과정",
    image: "/images/home/license-new04.jpg",
  },
];

export const RECOMMENDED_COURSES: CourseCardItem[] = [
  {
    id: "r1",
    title: "방역관리사",
    category: "한과 과정",
    image: "/images/home/license-hot04.jpg",
    ministry: "질병관리청",
  },
  {
    id: "r2",
    title: "간병사",
    category: "실버 과정",
    image: "/images/home/license-new03.jpg",
    ministry: "보건복지부",
  },
  {
    id: "r3",
    title: "병원동행매니저",
    category: "실버 과정",
    image: "/images/home/license-hot01.jpg",
    ministry: "보건복지부",
  },
  {
    id: "r4",
    title: "생활지원사",
    category: "실버 과정",
    image: "/images/home/license-new02.jpg",
    ministry: "보건복지부",
  },
];

export const NOTICE_ITEMS: NoticeItem[] = [
  { id: "1", title: "2026 교육나눔지원 수강신청방법", date: "2024.11.19" },
  { id: "2", title: "한국실습지원센터 실습매칭서비스", date: "2024.11.19" },
  { id: "3", title: "창의학습지도사 신규런칭 이벤트!", date: "2024.11.19" },
  { id: "4", title: "방과후아동지도사 신규런칭 EVENT!", date: "2024.11.19" },
  { id: "5", title: "수강 및 출석관련공지", date: "2024.11.19" },
];

export const CENTER_NEWS_ITEMS: NoticeItem[] = [
  {
    id: "1",
    title: "2026년 교육원 우수수강생 시상식 안내",
    date: "2024.11.12",
  },
  { id: "2", title: "설 연휴 고객센터 운영시간 안내", date: "2024.11.08" },
  { id: "3", title: "겨울학기 특별할인 이벤트 진행중", date: "2024.11.05" },
  { id: "4", title: "모바일 학습 앱 업데이트 안내", date: "2024.10.28" },
  { id: "5", title: "자격증 발급 처리기간 변경 안내", date: "2024.10.21" },
];

export const FAQ_ITEMS: FaqItem[] = [
  { id: "1", question: "수강전 PC설정은 어떻게 하나요?" },
  { id: "2", question: "동영상 오류시 어떻게 해야하나요?" },
  { id: "3", question: "프로그램은 무엇을 다운받아야 하나요?" },
  {
    id: "4",
    question: "대학졸업증명서는 어디서 받나요?",
    links: [
      { label: "사이버가정학습터", href: "#" },
      { label: "평생교육원센터", href: "#" },
    ],
  },
];

export const QUICK_LINK_ITEMS: QuickLinkItem[] = [
  { id: "ql1", label: "FAQ", icon: HelpCircle, href: "#" },
  { id: "ql2", label: "원격지원", icon: Compass, href: "#" },
  { id: "ql3", label: "자격증 신청조회", icon: CheckCircle2, href: "#" },
  { id: "ql4", label: "학습강의실", icon: Video, href: "/classroom" },
];

export const PARTNER_LOGOS: PartnerLogo[] = [
  { id: "p1", label: "법무부" },
  { id: "p2", label: "식품의약품안전처" },
  { id: "p3", label: "교육부" },
  { id: "p4", label: "고용노동부" },
  { id: "p5", label: "보건복지부" },
  { id: "p6", label: "국가평생교육진흥원" },
  { id: "p7", label: "한국직업능력개발원" },
  { id: "p8", label: "과학기술정보통신부" },
  { id: "p9", label: "중소벤처기업부" },
];

export const FOOTER_LINKS: FooterLink[] = [
  { label: "교육원 소개", href: "#" },
  { label: "이용약관", href: "#" },
  { label: "개인정보처리방침", href: "#" },
];

export const FAMILY_SITES: FamilySite[] = [
  { label: "국가평생교육진흥원", href: "http://www.nile.or.kr" },
  { label: "교육부", href: "http://www.moe.go.kr" },
  { label: "한국직업능력개발원", href: "http://www.pqi.or.kr" },
  { label: "한국사회복지사협회", href: "http://www.welfare.net" },
];

export const FOOTER_COMPANY = {
  name: "(주)한평생그룹",
  representative: "양병웅",
  businessNumber: "227-88-03196",
  address: "서울시 도봉구 창동 마들로13길 61 씨드큐브 905호",
  phone: "02-2135-9249",
  email: "info@hanpyeong.kr",
  mailOrderReport: "제24-도봉-0983호",
  hours: "평일 09:00 ~ 18:00 (점심 12:00~14:00)",
};

export const CUSTOMER_CENTER = {
  phone: "02.2135.9249",
  hours: "10:00 ~ 18:00 (점심시간 12:00 ~ 14:00)",
  closedDays: "금요일, 토요일, 일요일, 공휴일",
  bankName: "신한은행",
  bankAccount: "140-015-307601",
  bankHolder: "(주)한평생그룹",
};
