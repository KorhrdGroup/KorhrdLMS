/**
 * 알림톡 템플릿 정의 — 클라이언트에서도 import 하는 파일이라 서버 전용 의존
 * (supabase·next/headers)을 두면 안 됩니다. 발송 로직은 alimtalk.ts 에 있습니다.
 *
 * tplCode 는 카카오 검수 승인 후 알리고 관리자(https://smartsms.aligo.in)
 * 알림톡 > 템플릿 관리에서 확인해 기입합니다. 검수 전에는 코드가 비어 있어
 * 발송이 스킵됩니다(에러 아님).
 */

export const ALIMTALK_TEMPLATES = {
  /** 회원가입 완료 안내 (UK_3817, 2026-08-20 재승인본 — 옛 UG_9893 대체) */
  SIGNUP: {
    tplCode: "UK_3817",
    message: `안녕하세요, #{고객명} 학습자님 회원가입이 완료되어 무료수강 가능한 상태입니다.

⭐️수강안내⭐️
교육원(https://www.korhrd.co.kr) 접속 후 로그인하시면 원하시는 과정 8과목까지 무료로 신청이 수강신청이 가능합니다.
(로그인 ▶ 수강신청 ▶ 과목선택)

*수강신청이 어려우시면 본원에서 직접 열어드리고 있으니 편하게 말씀주시길 바랍니다.

⭐️교육나눔⭐️
※수강료 & 교안파일 & 예상문제 & 시험응시료는 무료로 지원해드립니다.

※강의는 기본 5주 과정이지만 정해진 시간표 없이 자유롭게 수강 가능합니다.

▶한국직업능력연구원에 정식 등록된 자격증으로 이력서에 기재 가능하며 갱신이 필요 없는 평생 유효한 자격증입니다.◀

🏅 학습자 과정 이수율 98% 이상
🏅 수강생 평균 만족도 4.8점
🏅 전담 관리 시스템 운영`,
    button: {
      button: [
        {
          name: "교육원 바로가기",
          linkType: "WL",
          linkTypeName: "웹링크",
          linkMo: "https://www.korhrd.co.kr",
          linkPc: "https://www.korhrd.co.kr",
        },
      ],
    },
  },
  /** 수강신청 완료 안내 (UK_3816) */
  ENROLLMENT_DONE: {
    tplCode: "UK_3816",
    message: `#{고객명} 학습자님, 수강신청이 완료되었습니다. 전문가로 가는 첫걸음을 이어가시길 응원드립니다.

어렵게 결심하신 교육과정, 끝까지 완주하여 뜻깊은 스펙을 완성하시길 바랍니다.^^

✅ 이어서 공부하기
• 교육원 접속 후 [나의 강의실] 입장
• 100% 온라인 과정으로 언제 어디서든 수강 가능!
교육원 접속 :  https://www.korhrd.co.kr

💡 본 자격증은 [한국직업능력연구원]에 정식 등록된 자격증으로, 취득 후 평생 활용 가능합니다.`,
    button: {
      button: [
        {
          name: "교육원 바로가기",
          linkType: "WL",
          linkTypeName: "웹링크",
          linkMo: "https://www.korhrd.co.kr",
          linkPc: "https://www.korhrd.co.kr",
        },
      ],
    },
  },
  /** 수강률 60% 미만 — 수강 독려 (UK_3815) */
  PROGRESS_UNDER_60: {
    tplCode: "UK_3815",
    message: `#{고객명} 학습자님, 전문가로서의 기반이 만들어지고 있습니다.

조금만 더 이어가시면 충분히 수료까지 도달하실 수 있는 단계입니다. 끝까지 응원하겠습니다.^^

※ 수강률 60% 이상 시 시험 응시가 가능합니다.

✅ 이어서 공부하기
• 홈페이지 접속 후 [나의 강의실] 입장
• 100% 온라인 과정으로 언제 어디서든 수강 가능!
교육원 접속 :  https://www.korhrd.co.kr

💡 본 자격증은 [한국직업능력연구원]에 정식 등록된 자격증으로, 취득 후 평생 활용 가능합니다`,
    button: {
      button: [
        {
          name: "교육원 바로가기",
          linkType: "WL",
          linkTypeName: "웹링크",
          linkMo: "https://www.korhrd.co.kr/",
          linkPc: "https://www.korhrd.co.kr/",
        },
      ],
    },
  },
  /** 수강률 60% 이상 — 시험 응시 안내 (UK_3818) */
  PROGRESS_OVER_60: {
    tplCode: "UK_3818",
    message: `#{고객명} 학습자님, 전문가로서의 기반이 거의 다 만들어졌습니다.

현재 수강률이 60% 이상이 넘어 시험 응시가 가능합니다.

나의 강의실 - 학습자료 - 기출문제 클릭 시 모의고사도 진행 가능하며
재시험 또한 가능하니 부담 갖지 마시고 가볍게 응시해 보시길 추천드립니다^^

✅ 이어서 공부하기
• 홈페이지 접속 후 [나의 강의실] 입장
• 100% 온라인 과정으로 언제 어디서든 수강 가능!
교육원 접속 :  https://www.korhrd.co.kr

💡 본 자격증은 [한국직업능력연구원]에 정식 등록된 자격증으로, 취득 후 평생 활용 가능합니다`,
    button: {
      button: [
        {
          name: "교육원 바로가기",
          linkType: "WL",
          linkTypeName: "웹링크",
          linkMo: "https://www.korhrd.co.kr/",
          linkPc: "https://www.korhrd.co.kr/",
        },
      ],
    },
  },
  /** 시험 합격 축하 (UK_3820, 2026-08-26 승인 — 알리고 원문 그대로, 변수 없음) */
  EXAM_PASS: {
    tplCode: "UK_3820",
    message: `합격 축하드립니다. 🥳🎉

과정 수료되어 자격증 발급 가능하시고,
발급 후 효력이 생겨 정식으로 활용 및 활동 가능하십니다.

💡 본 자격증은 [한국직업능력연구원]에 정식 등록된 자격증으로, 취득 후 평생 활용 가능합니다.`,
    button: {
      button: [
        {
          name: "자격증 신청하러 가기",
          linkType: "WL",
          linkTypeName: "웹링크",
          linkMo: "https://www.korhrd.co.kr/",
          linkPc: "https://www.korhrd.co.kr/",
        },
      ],
    },
  },
} as const;

/** 어드민 테스트 발송 화면에 보여줄 한글 이름 */
export const ALIMTALK_TEMPLATE_LABELS: Record<AlimtalkTemplateKey, string> = {
  SIGNUP: "회원가입 완료",
  ENROLLMENT_DONE: "수강신청 완료",
  PROGRESS_UNDER_60: "수강률 60% 미만 독려",
  PROGRESS_OVER_60: "수강률 60% 이상 시험 안내",
  EXAM_PASS: "시험 합격 축하",
};

export type AlimtalkTemplateKey = keyof typeof ALIMTALK_TEMPLATES;

