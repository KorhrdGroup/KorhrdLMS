import type { JobGroup, Job } from '@/features/korhrd/lib/types';

/**
 * 취업 길찾기 데이터 — 프로토타입 assets/js/jobs-data.js 를 그대로 옮긴 것입니다.
 * 직업군 10개 · 직업 39개.
 *
 * ⚠ groups[].cat 은 courses.ts 의 c(분야) 값과 정확히 같아야 합니다.
 *   두 화면(취업 길찾기 / 수강신청 필터)이 같은 분류를 쓰기 때문입니다.
 *   name 은 사람이 읽는 표기라 가운뎃점 앞뒤가 띄어져 있습니다 — 비교에 쓰지 마세요.
 */
export const JOB_GROUPS: JobGroup[] = [
    { key: "welfare", name: "복지 · 돌봄", desc: "어르신·아이·가정을 돌보는 일", cat: "복지·돌봄" },
    { key: "education", name: "교육 · 아동", desc: "아이들을 가르치고 이끄는 일", cat: "교육·아동" },
    { key: "counsel", name: "상담", desc: "마음을 듣고 돕는 일", cat: "상담" },
    { key: "medical", name: "병원 · 의료", desc: "병원과 환자를 돕는 일", cat: "병원·의료" },
    { key: "pet", name: "반려동물", desc: "반려동물과 함께하는 일", cat: "반려동물" },
    { key: "beauty", name: "뷰티", desc: "아름다움을 다루는 일", cat: "뷰티" },
    { key: "office", name: "마케팅 · 사무", desc: "홍보·관리·실무 전문직", cat: "마케팅·사무" },
    { key: "esg", name: "ESG · 환경", desc: "환경과 지속가능성을 다루는 일", cat: "ESG·환경" },
    { key: "it", name: "IT · 디지털", desc: "디지털·데이터를 다루는 일", cat: "IT·디지털" },
    { key: "hobby", name: "창업 · 취미", desc: "좋아하는 일로 시작하는 창업", cat: "창업·취미" }
  ];

/** 직업군별 채용공고 사이트 */
export type JobSite = {
  name: string;
  url?: string;
  /**
   * 사이트 로고 파일명(확장자 포함) — public/job-site/{logo}.
   * 16x16 자리에 들어갑니다. 없으면 마크 없이 이름만 나옵니다.
   */
  logo?: string;
};

export const JOB_SITES: Record<string, JobSite[]> = {
    "welfare": [
      { name: "복지넷", url: "https://www.bokji.net/job/off/01.bokji", logo: "bokji.svg" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "지역 복지관 홈페이지" }
    ],
    "education": [
      { name: "에듀넷", logo: "edunet.png", url: "https://www.edunet.net" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "지역 교육청·학교 채용" }
    ],
    "counsel": [
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "한국심리학회", logo: "kpa.jpg", url: "https://www.koreanpsychology.or.kr" },
      { name: "지역 상담센터" }
    ],
    "medical": [
      { name: "메디잡", logo: "medijob.png", url: "https://www.medijob.cc" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "병원 채용 홈페이지" }
    ],
    "pet": [
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "반려동물 관련 커뮤니티" },
      { name: "동물병원 채용" }
    ],
    "beauty": [
      { name: "뷰티잡", logo: "beautyjob.png", url: "https://www.beautyjob.kr" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "지역 매장 채용" }
    ],
    "office": [
      { name: "사람인", logo: "saramin.jpg", url: "https://www.saramin.co.kr" },
      { name: "잡코리아", logo: "jobkorea.webp", url: "https://www.jobkorea.co.kr" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" }
    ],
    "esg": [
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      /* 환경부도 고용24와 같은 국가 사이트라 같은 마크를 씁니다 */
      { name: "환경부 채용", url: "https://www.mcee.go.kr/home/web/index.do?menuId=10574", logo: "work24.svg" },
      { name: "지자체 환경 일자리" }
    ],
    "it": [
      { name: "원티드", logo: "wanted.png", url: "https://www.wanted.co.kr" },
      { name: "점핏", logo: "jumpit.webp", url: "https://www.jumpit.co.kr" },
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" }
    ],
    "hobby": [
      { name: "고용24", url: "https://www.work24.go.kr/wk/a/b/1200/retriveDtlEmpSrchList.do", logo: "work24.svg" },
      { name: "지역 문화센터" },
      { name: "소상공인 창업 지원" }
    ]
  };

export const JOBS: Job[] = [
    {
      "g": "welfare",
      "name": "생활지원사",
      "course": "노인돌봄생활지원사 1급",
      "summary": "어르신의 일상생활을 곁에서 돕고 안부를 살핍니다.",
      "tasks": [
        "어르신 생활지원",
        "안부 확인",
        "말벗",
        "일상생활 지원"
      ],
      "recommend": [
        "사람을 좋아하는 분",
        "봉사활동에 관심 있는 분",
        "지역사회에서 일하고 싶은 분"
      ],
      "workplaces": [
        "종합사회복지관",
        "노인복지관",
        "재가센터"
      ],
      "keywords": [
        "생활지원사",
        "노인맞춤돌봄서비스",
        "생활지원 전담"
      ]
    },
    {
      "g": "welfare",
      "name": "간병사",
      "course": "간병사 1급",
      "summary": "거동이 불편한 환자·어르신의 곁에서 간병을 돕습니다.",
      "tasks": [
        "환자 간병",
        "식사·이동 보조",
        "위생 관리",
        "정서적 지원"
      ],
      "recommend": [
        "돌봄에 보람을 느끼는 분",
        "안정적인 일자리를 원하는 분"
      ],
      "workplaces": [
        "요양병원",
        "종합병원",
        "재가센터"
      ],
      "keywords": [
        "간병사",
        "병원 간병",
        "재가 간병"
      ]
    },
    {
      "g": "welfare",
      "name": "병원동행매니저",
      "course": "병원동행매니저 1급",
      "summary": "혼자 병원 방문이 어려운 분과 동행하며 진료를 돕습니다.",
      "tasks": [
        "병원 동행",
        "접수·수납 보조",
        "진료 안내",
        "귀가 지원"
      ],
      "recommend": [
        "활동적인 일을 좋아하는 분",
        "어르신과 소통을 잘하는 분"
      ],
      "workplaces": [
        "시니어 케어 업체",
        "복지관",
        "병원 연계 서비스"
      ],
      "keywords": [
        "병원동행매니저",
        "시니어 동행",
        "병원 동행 서비스"
      ]
    },
    {
      "g": "welfare",
      "name": "실버케어지도사",
      "course": "실버케어지도사 1급",
      "summary": "어르신의 여가·인지 활동을 기획하고 진행합니다.",
      "tasks": [
        "인지 활동 진행",
        "여가 프로그램 기획",
        "건강 관리 지원"
      ],
      "recommend": [
        "프로그램 진행에 관심 있는 분",
        "어르신과 교감하고 싶은 분"
      ],
      "workplaces": [
        "주야간보호센터",
        "노인복지관",
        "요양시설"
      ],
      "keywords": [
        "실버케어지도사",
        "인지활동 지도사",
        "노인여가 프로그램"
      ]
    },
    {
      "g": "welfare",
      "name": "산모신생아건강관리사",
      "course": "산모신생아건강관리사 1급",
      "summary": "출산 가정을 방문해 산모와 신생아의 건강을 돌봅니다.",
      "tasks": [
        "산모 건강관리",
        "신생아 돌봄",
        "가사 지원",
        "수유 지도"
      ],
      "recommend": [
        "아이를 좋아하는 분",
        "돌봄 경험을 살리고 싶은 분"
      ],
      "workplaces": [
        "산후관리 업체",
        "정부지원 산모신생아 서비스"
      ],
      "keywords": [
        "산모신생아건강관리사",
        "산후도우미",
        "정부지원 산후관리"
      ]
    },
    {
      "g": "welfare",
      "name": "베이비시터",
      "course": "베이비시터 1급",
      "summary": "가정을 방문해 영유아를 안전하게 돌봅니다.",
      "tasks": [
        "영유아 돌봄",
        "놀이 활동",
        "식사·위생 관리"
      ],
      "recommend": [
        "아이와 함께하는 일을 좋아하는 분",
        "유연한 근무를 원하는 분"
      ],
      "workplaces": [
        "가정",
        "아이돌봄 서비스 기관"
      ],
      "keywords": [
        "베이비시터",
        "아이돌보미",
        "가정 보육"
      ]
    },
    {
      "g": "education",
      "name": "방과후학교지도사",
      "course": "방과후학교지도사 1급",
      "summary": "학교 방과후 교실에서 아이들의 학습과 활동을 지도합니다.",
      "tasks": [
        "방과후 수업 진행",
        "학습 지도",
        "활동 프로그램 운영"
      ],
      "recommend": [
        "아이들을 가르치는 일을 좋아하는 분",
        "경력 단절 후 복귀하려는 분"
      ],
      "workplaces": [
        "초등학교 방과후 교실",
        "지역아동센터",
        "공부방"
      ],
      "keywords": [
        "방과후학교지도사",
        "방과후 강사",
        "초등 방과후"
      ]
    },
    {
      "g": "education",
      "name": "방과후아동지도사",
      "course": "방과후아동지도사 1급",
      "summary": "돌봄이 필요한 아동을 방과후 시간에 보살피고 지도합니다.",
      "tasks": [
        "아동 돌봄",
        "생활 지도",
        "놀이·학습 지원"
      ],
      "recommend": [
        "아동 돌봄에 관심 있는 분",
        "따뜻한 성품을 가진 분"
      ],
      "workplaces": [
        "지역아동센터",
        "초등 돌봄교실",
        "아동복지시설"
      ],
      "keywords": [
        "방과후아동지도사",
        "초등돌봄전담사",
        "아동 돌봄"
      ]
    },
    {
      "g": "education",
      "name": "독서지도사",
      "course": "독서지도사 1급",
      "summary": "아이들의 독서 습관과 논술 역량을 길러줍니다.",
      "tasks": [
        "독서 지도",
        "독후 활동",
        "논술 첨삭"
      ],
      "recommend": [
        "책을 좋아하는 분",
        "글쓰기 지도에 관심 있는 분"
      ],
      "workplaces": [
        "공부방",
        "독서논술 학원",
        "문화센터"
      ],
      "keywords": [
        "독서지도사",
        "독서논술 강사",
        "논술 지도"
      ]
    },
    {
      "g": "education",
      "name": "코딩지도사",
      "course": "코딩지도사 1급",
      "summary": "아이들에게 코딩과 컴퓨팅 사고를 가르칩니다.",
      "tasks": [
        "코딩 교육",
        "SW 활동 지도",
        "창의 프로젝트 운영"
      ],
      "recommend": [
        "디지털 교육에 관심 있는 분",
        "아이들과 소통을 잘하는 분"
      ],
      "workplaces": [
        "코딩 학원",
        "방과후 교실",
        "문화센터"
      ],
      "keywords": [
        "코딩지도사",
        "SW 강사",
        "방과후 코딩"
      ]
    },
    {
      "g": "education",
      "name": "진로적성상담사",
      "course": "진로적성상담사 & 진로직업상담사",
      "summary": "학생·구직자의 진로와 적성을 진단하고 안내합니다.",
      "tasks": [
        "진로 상담",
        "적성 검사",
        "진학·직업 정보 제공"
      ],
      "recommend": [
        "사람의 성장을 돕고 싶은 분",
        "상담에 관심 있는 분"
      ],
      "workplaces": [
        "학교",
        "진로체험센터",
        "취업지원기관"
      ],
      "keywords": [
        "진로적성상담사",
        "진로직업상담사",
        "진로 코치"
      ]
    },
    {
      "g": "education",
      "name": "아동미술지도사",
      "course": "아동미술지도사 1급",
      "summary": "아이들의 창의력을 미술 활동으로 키워줍니다.",
      "tasks": [
        "미술 수업",
        "창의 활동 지도",
        "작품 전시 운영"
      ],
      "recommend": [
        "그림·만들기를 좋아하는 분",
        "아이들과 활동하는 일을 원하는 분"
      ],
      "workplaces": [
        "미술학원",
        "방과후 교실",
        "공방"
      ],
      "keywords": [
        "아동미술지도사",
        "미술 강사",
        "방과후 미술"
      ]
    },
    {
      "g": "counsel",
      "name": "심리상담사",
      "course": "심리상담사 1급",
      "summary": "마음의 어려움을 듣고 심리적 회복을 돕습니다.",
      "tasks": [
        "심리 상담",
        "정서 지원",
        "심리 검사 보조"
      ],
      "recommend": [
        "공감 능력이 있는 분",
        "사람의 마음을 돕고 싶은 분"
      ],
      "workplaces": [
        "심리상담센터",
        "복지관",
        "기업 상담실"
      ],
      "keywords": [
        "심리상담사",
        "상담 전문가",
        "심리 지원"
      ]
    },
    {
      "g": "counsel",
      "name": "노인심리상담사",
      "course": "노인심리상담사 1급",
      "summary": "어르신의 정서와 심리를 이해하고 상담합니다.",
      "tasks": [
        "노인 심리 상담",
        "정서 지원",
        "우울·고립 예방"
      ],
      "recommend": [
        "어르신과 소통을 잘하는 분",
        "상담에 관심 있는 분"
      ],
      "workplaces": [
        "노인복지관",
        "주야간보호센터",
        "상담센터"
      ],
      "keywords": [
        "노인심리상담사",
        "노인 정서 지원",
        "시니어 상담"
      ]
    },
    {
      "g": "counsel",
      "name": "아동심리상담사",
      "course": "아동심리상담사",
      "summary": "아이들의 정서·행동을 이해하고 심리를 돕습니다.",
      "tasks": [
        "아동 심리 상담",
        "놀이 치료 보조",
        "부모 상담"
      ],
      "recommend": [
        "아이의 마음에 관심 있는 분",
        "섬세한 성품을 가진 분"
      ],
      "workplaces": [
        "아동상담센터",
        "복지관",
        "아동발달센터"
      ],
      "keywords": [
        "아동심리상담사",
        "아동 정서 지원",
        "놀이 상담"
      ]
    },
    {
      "g": "counsel",
      "name": "미술심리상담사",
      "course": "미술심리상담사 1급",
      "summary": "미술 활동을 통해 마음을 표현하고 치유를 돕습니다.",
      "tasks": [
        "미술 심리 상담",
        "표현 활동 진행",
        "정서 회복 지원"
      ],
      "recommend": [
        "미술과 상담에 모두 관심 있는 분"
      ],
      "workplaces": [
        "심리상담센터",
        "복지관",
        "문화센터"
      ],
      "keywords": [
        "미술심리상담사",
        "미술치료",
        "표현예술 상담"
      ]
    },
    {
      "g": "counsel",
      "name": "가족상담사",
      "course": "가족상담사 1급",
      "summary": "가족 관계의 갈등을 이해하고 회복을 돕습니다.",
      "tasks": [
        "가족 상담",
        "부부·부모 상담",
        "관계 회복 지원"
      ],
      "recommend": [
        "관계 문제에 관심 있는 분",
        "경청을 잘하는 분"
      ],
      "workplaces": [
        "가족센터",
        "상담센터",
        "복지관"
      ],
      "keywords": [
        "가족상담사",
        "부모교육상담사",
        "가족 관계 상담"
      ]
    },
    {
      "g": "medical",
      "name": "병원코디네이터",
      "course": "병원코디네이터 1급",
      "summary": "병원 접점에서 고객 응대와 진료 안내를 담당합니다.",
      "tasks": [
        "고객 응대",
        "진료 안내",
        "예약·수납 관리"
      ],
      "recommend": [
        "서비스 마인드가 있는 분",
        "병원 근무를 원하는 분"
      ],
      "workplaces": [
        "의원·병원",
        "치과·피부과",
        "건강검진센터"
      ],
      "keywords": [
        "병원코디네이터",
        "병원 안내",
        "메디컬 코디"
      ]
    },
    {
      "g": "medical",
      "name": "병원원무행정전문가",
      "course": "병원원무행정전문가 1급",
      "summary": "병원의 원무·행정 업무를 전문적으로 처리합니다.",
      "tasks": [
        "접수·수납",
        "보험 청구",
        "환자 정보 관리"
      ],
      "recommend": [
        "꼼꼼한 사무 업무를 잘하는 분"
      ],
      "workplaces": [
        "병원 원무과",
        "요양병원",
        "건강검진센터"
      ],
      "keywords": [
        "병원원무행정",
        "원무 행정",
        "의료 사무"
      ]
    },
    {
      "g": "medical",
      "name": "방역관리사",
      "course": "방역관리사 1급",
      "summary": "감염병 예방과 방역 관리를 담당합니다.",
      "tasks": [
        "방역 관리",
        "소독 계획 수립",
        "위생 점검"
      ],
      "recommend": [
        "공중보건에 관심 있는 분",
        "현장 업무를 선호하는 분"
      ],
      "workplaces": [
        "방역 업체",
        "시설 관리",
        "지자체 위탁"
      ],
      "keywords": [
        "방역관리사",
        "감염 예방",
        "위생 관리"
      ]
    },
    {
      "g": "pet",
      "name": "반려동물관리사",
      "course": "반려동물관리사",
      "summary": "반려동물의 건강·행동·돌봄을 전문적으로 관리합니다.",
      "tasks": [
        "반려동물 돌봄",
        "기본 미용·위생",
        "건강 관리 보조"
      ],
      "recommend": [
        "동물을 사랑하는 분",
        "반려산업에 진출하려는 분"
      ],
      "workplaces": [
        "펫샵",
        "동물병원",
        "반려동물 돌봄 서비스"
      ],
      "keywords": [
        "반려동물관리사",
        "펫시터",
        "반려동물 돌봄"
      ]
    },
    {
      "g": "pet",
      "name": "반려동물행동상담지도사",
      "course": "반려동물행동상담지도사 1급",
      "summary": "반려동물의 문제 행동을 이해하고 교정을 돕습니다.",
      "tasks": [
        "행동 상담",
        "교정 지도",
        "보호자 교육"
      ],
      "recommend": [
        "동물 행동에 관심 있는 분"
      ],
      "workplaces": [
        "반려동물 훈련소",
        "펫 카페",
        "상담 서비스"
      ],
      "keywords": [
        "반려동물행동상담",
        "행동교정",
        "펫 트레이너"
      ]
    },
    {
      "g": "beauty",
      "name": "메이크업코디네이터",
      "course": "메이크업코디네이터 1급",
      "summary": "상황과 이미지에 맞는 메이크업을 연출합니다.",
      "tasks": [
        "메이크업",
        "이미지 컨설팅",
        "현장 스타일링"
      ],
      "recommend": [
        "뷰티에 관심 있는 분",
        "손재주가 좋은 분"
      ],
      "workplaces": [
        "메이크업 스튜디오",
        "웨딩·행사",
        "뷰티 매장"
      ],
      "keywords": [
        "메이크업코디네이터",
        "메이크업 아티스트",
        "뷰티 스타일리스트"
      ]
    },
    {
      "g": "beauty",
      "name": "피부미용코디네이터",
      "course": "피부미용코디네이터 1급",
      "summary": "피부 상태를 진단하고 관리 프로그램을 제공합니다.",
      "tasks": [
        "피부 관리",
        "상담·컨설팅",
        "제품 안내"
      ],
      "recommend": [
        "피부·미용에 관심 있는 분"
      ],
      "workplaces": [
        "피부관리실",
        "에스테틱",
        "뷰티 매장"
      ],
      "keywords": [
        "피부미용코디네이터",
        "피부관리사",
        "에스테틱"
      ]
    },
    {
      "g": "beauty",
      "name": "네일아트코디네이터",
      "course": "네일아트코디네이터 1급",
      "summary": "네일 케어와 아트로 손끝의 아름다움을 완성합니다.",
      "tasks": [
        "네일 케어",
        "네일 아트",
        "고객 상담"
      ],
      "recommend": [
        "섬세한 작업을 좋아하는 분",
        "창업에 관심 있는 분"
      ],
      "workplaces": [
        "네일샵",
        "뷰티 매장",
        "1인 창업"
      ],
      "keywords": [
        "네일아트",
        "네일리스트",
        "네일샵"
      ]
    },
    {
      "g": "beauty",
      "name": "헤어코디네이터",
      "course": "헤어코디네이터 1급",
      "summary": "헤어 스타일링과 두피·모발 관리를 담당합니다.",
      "tasks": [
        "헤어 스타일링",
        "두피·모발 관리",
        "고객 상담"
      ],
      "recommend": [
        "헤어 디자인에 관심 있는 분"
      ],
      "workplaces": [
        "헤어샵",
        "미용실",
        "뷰티 매장"
      ],
      "keywords": [
        "헤어코디네이터",
        "헤어 디자이너",
        "미용실"
      ]
    },
    {
      "g": "office",
      "name": "SNS마케팅전문가",
      "course": "SNS마케팅전문가",
      "summary": "SNS 채널을 기획·운영해 브랜드를 홍보합니다.",
      "tasks": [
        "콘텐츠 기획",
        "채널 운영",
        "성과 분석"
      ],
      "recommend": [
        "SNS·콘텐츠에 관심 있는 분",
        "재택 근무를 원하는 분"
      ],
      "workplaces": [
        "마케팅 대행사",
        "기업 마케팅팀",
        "프리랜서"
      ],
      "keywords": [
        "SNS마케팅",
        "콘텐츠 마케터",
        "디지털 마케팅"
      ]
    },
    {
      "g": "office",
      "name": "유튜브크리에이터",
      "course": "유튜브크리에이터 1급",
      "summary": "영상 콘텐츠를 기획·제작해 채널을 운영합니다.",
      "tasks": [
        "영상 기획",
        "촬영·편집",
        "채널 운영"
      ],
      "recommend": [
        "영상 제작에 관심 있는 분",
        "1인 미디어를 꿈꾸는 분"
      ],
      "workplaces": [
        "미디어 제작사",
        "기업 콘텐츠팀",
        "1인 창작"
      ],
      "keywords": [
        "유튜브 크리에이터",
        "영상 편집",
        "콘텐츠 제작"
      ]
    },
    {
      "g": "office",
      "name": "부동산권리분석사",
      "course": "부동산권리분석사 1급",
      "summary": "부동산 권리관계를 분석하고 안전한 거래를 돕습니다.",
      "tasks": [
        "권리 분석",
        "등기·서류 검토",
        "리스크 진단"
      ],
      "recommend": [
        "부동산·법률에 관심 있는 분"
      ],
      "workplaces": [
        "공인중개사무소",
        "부동산 컨설팅",
        "금융기관"
      ],
      "keywords": [
        "부동산권리분석사",
        "권리분석",
        "부동산 컨설팅"
      ]
    },
    {
      "g": "office",
      "name": "집합건물관리사",
      "course": "집합건물관리사 1급",
      "summary": "아파트·상가 등 집합건물의 관리 업무를 담당합니다.",
      "tasks": [
        "시설 관리",
        "회계·행정",
        "입주민 응대"
      ],
      "recommend": [
        "관리·행정 업무를 선호하는 분"
      ],
      "workplaces": [
        "관리사무소",
        "건물관리 업체",
        "자산관리 회사"
      ],
      "keywords": [
        "집합건물관리사",
        "시설 관리",
        "건물 관리"
      ]
    },
    {
      "g": "esg",
      "name": "ESG경영평가사",
      "course": "ESG 경영평가사 1급",
      "summary": "기업의 환경·사회·지배구조 경영을 평가·컨설팅합니다.",
      "tasks": [
        "ESG 진단",
        "보고서 작성",
        "개선안 제안"
      ],
      "recommend": [
        "지속가능경영에 관심 있는 분",
        "분석 업무를 잘하는 분"
      ],
      "workplaces": [
        "컨설팅사",
        "기업 ESG팀",
        "평가기관"
      ],
      "keywords": [
        "ESG경영평가사",
        "ESG 컨설턴트",
        "지속가능경영"
      ]
    },
    {
      "g": "esg",
      "name": "환경관리전문가",
      "course": "환경관리전문가 1급",
      "summary": "사업장의 환경 관리와 규제 대응을 담당합니다.",
      "tasks": [
        "환경 관리",
        "오염 저감",
        "법규 대응"
      ],
      "recommend": [
        "환경 분야에 관심 있는 분"
      ],
      "workplaces": [
        "제조 기업",
        "환경 관리 업체",
        "지자체"
      ],
      "keywords": [
        "환경관리전문가",
        "환경 관리",
        "오염 관리"
      ]
    },
    {
      "g": "esg",
      "name": "자원순환관리사",
      "course": "자원순환관리사",
      "summary": "폐기물 저감과 자원 재활용 체계를 관리합니다.",
      "tasks": [
        "자원순환 관리",
        "재활용 체계 운영",
        "저감 계획 수립"
      ],
      "recommend": [
        "환경·순환경제에 관심 있는 분"
      ],
      "workplaces": [
        "재활용 업체",
        "지자체 환경부서",
        "제조 기업"
      ],
      "keywords": [
        "자원순환관리사",
        "재활용 관리",
        "폐기물 관리"
      ]
    },
    {
      "g": "esg",
      "name": "도시농업전문가",
      "course": "도시농업전문가 1급",
      "summary": "도시 공간에서 농업·텃밭을 기획하고 운영합니다.",
      "tasks": [
        "도시농업 기획",
        "텃밭 운영",
        "교육 진행"
      ],
      "recommend": [
        "식물·농업에 관심 있는 분",
        "귀농·귀촌을 준비하는 분"
      ],
      "workplaces": [
        "도시농업 센터",
        "지자체",
        "사회적 기업"
      ],
      "keywords": [
        "도시농업전문가",
        "도시농부",
        "텃밭 지도"
      ]
    },
    {
      "g": "it",
      "name": "데이터라벨러",
      "course": "데이터라벨러 1급",
      "summary": "AI 학습용 데이터를 가공·분류하는 일을 합니다.",
      "tasks": [
        "데이터 라벨링",
        "품질 검수",
        "가공 작업"
      ],
      "recommend": [
        "재택·유연 근무를 원하는 분",
        "꼼꼼한 작업을 잘하는 분"
      ],
      "workplaces": [
        "AI 데이터 기업",
        "크라우드소싱",
        "재택 근무"
      ],
      "keywords": [
        "데이터라벨러",
        "AI 데이터",
        "데이터 가공"
      ]
    },
    {
      "g": "it",
      "name": "디지털리터러시지도사",
      "course": "디지털리터러시지도사 1급",
      "summary": "디지털 기기·서비스 활용 역량을 교육합니다.",
      "tasks": [
        "디지털 교육",
        "정보 활용 지도",
        "생활 밀착 IT 안내"
      ],
      "recommend": [
        "디지털 교육에 관심 있는 분",
        "어르신 대상 교육에 보람을 느끼는 분"
      ],
      "workplaces": [
        "복지관",
        "평생학습관",
        "디지털 배움터"
      ],
      "keywords": [
        "디지털리터러시지도사",
        "디지털 강사",
        "정보화 교육"
      ]
    },
    {
      "g": "hobby",
      "name": "바리스타",
      "course": "바리스타 1급",
      "summary": "커피를 추출하고 카페 운영에 필요한 역량을 갖춥니다.",
      "tasks": [
        "커피 추출",
        "메뉴 제조",
        "매장 운영 보조"
      ],
      "recommend": [
        "커피를 좋아하는 분",
        "카페 창업을 꿈꾸는 분"
      ],
      "workplaces": [
        "카페",
        "베이커리",
        "1인 창업"
      ],
      "keywords": [
        "바리스타",
        "카페 창업",
        "커피 전문가"
      ]
    },
    {
      "g": "hobby",
      "name": "운동처방전문가",
      "course": "운동처방전문가 1급",
      "summary": "개인 맞춤 운동 프로그램을 설계하고 지도합니다.",
      "tasks": [
        "운동 처방",
        "자세 지도",
        "건강 상담"
      ],
      "recommend": [
        "운동·건강에 관심 있는 분"
      ],
      "workplaces": [
        "헬스장",
        "복지관",
        "재활 센터"
      ],
      "keywords": [
        "운동처방전문가",
        "운동 지도",
        "생활체육"
      ]
    },
    {
      "g": "hobby",
      "name": "종이접기지도사",
      "course": "종이접기지도사 1급",
      "summary": "종이접기 공예를 가르치고 활동을 진행합니다.",
      "tasks": [
        "종이접기 수업",
        "공예 활동 진행",
        "작품 지도"
      ],
      "recommend": [
        "만들기를 좋아하는 분",
        "문화센터 강사를 원하는 분"
      ],
      "workplaces": [
        "문화센터",
        "방과후 교실",
        "복지관"
      ],
      "keywords": [
        "종이접기지도사",
        "공예 강사",
        "종이 공예"
      ]
    }
  ];

/** 직업군 key 로 직업 목록 */
export function jobsOfGroup(key: string): Job[] {
  return JOBS.filter((x) => x.g === key);
}

/** 직업명으로 한 건 찾기 (직업 상세) */
export function findJob(name: string): Job | undefined {
  return JOBS.find((x) => x.name === name);
}

/**
 * 과정명 비교용 정규화.
 *
 * 이 파일의 course 값은 프로토타입 표기(급수 포함, 띄어쓰기 있음)이고 DB의
 * `courses.name` 은 급수를 떼거나 붙여 쓰는 등 표기가 제각각입니다.
 * (예: "심리상담사 1급" ↔ "심리상담사", "병원코디네이터 1급" ↔ "병원코디네이터1급")
 * 공백을 지우고 끝의 급수 표기만 떼면 39개 직업이 모두 맞아떨어집니다.
 */
function normalizeCourseName(name: string): string {
  return name.replace(/\s+/g, "").replace(/[1-3]급$/, "");
}

/**
 * 과정명으로 그 과정과 연결된 직업 찾기.
 *
 * 과정 상세페이지에서 "취업 길찾기" 버튼을 띄울지 판단하는 데 씁니다 —
 * 길찾기에 없는 과정에서 누르면 관계없는 목록으로 보내게 되므로,
 * 연결된 직업이 있을 때만 버튼을 보여줍니다.
 */
export function findJobByCourseName(courseName: string): Job | undefined {
  const target = normalizeCourseName(courseName);
  return JOBS.find((x) => normalizeCourseName(x.course) === target);
}
