/**
 * 알리고 카카오 알림톡 발송.
 *
 * Vercel은 나가는 IP가 매번 바뀌어 알리고 IP 화이트리스트에 걸립니다.
 * 그래서 한평생오피스가 쓰는 고정 IP 프록시(신한 프록시 서버의 /alimtalk)를
 * 경유합니다. 프록시 환경변수가 없으면 알리고를 직접 호출합니다(로컬 개발 등
 * 화이트리스트에 등록된 IP에서만 성공).
 *
 * 서버 전용입니다. NEXT_PUBLIC_ 접두사를 붙이면 키가 브라우저로 새어 나갑니다.
 */

const ALIGO_ALIMTALK_URL = "https://kakaoapi.aligo.in/akv10/alimtalk/send/";

/**
 * 알림톡 템플릿. tplCode는 카카오 검수 승인 후 알리고 관리자
 * (https://smartsms.aligo.in) 알림톡 > 템플릿 관리에서 확인해 기입합니다.
 * 검수 전에는 코드가 비어 있어 발송이 스킵됩니다(에러 아님).
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
} as const;

/** 어드민 테스트 발송 화면에 보여줄 한글 이름 */
export const ALIMTALK_TEMPLATE_LABELS: Record<AlimtalkTemplateKey, string> = {
  SIGNUP: "회원가입 완료",
  ENROLLMENT_DONE: "수강신청 완료",
  PROGRESS_UNDER_60: "수강률 60% 미만 독려",
  PROGRESS_OVER_60: "수강률 60% 이상 시험 안내",
};

export type AlimtalkTemplateKey = keyof typeof ALIMTALK_TEMPLATES;

export type AligoConfig = {
  apiKey: string;
  userId: string;
  senderKey: string;
  sender: string;
  /** 고정 IP 프록시 (미설정 시 직접 호출) */
  proxyUrl: string | null;
  proxySecret: string | null;
};

export function getAligoConfig(): AligoConfig | null {
  const apiKey = process.env.ALIGO_API_KEY?.trim();
  const userId = process.env.ALIGO_USER_ID?.trim();
  const senderKey = process.env.ALIGO_SENDER_KEY?.trim();
  const sender = process.env.ALIGO_SENDER?.trim().replace(/\D/g, "");

  if (!apiKey || !userId || !senderKey || !sender) {
    return null;
  }

  return {
    apiKey,
    userId,
    senderKey,
    sender,
    proxyUrl: process.env.ALIGO_PROXY_URL?.trim().replace(/\/$/, "") || null,
    proxySecret: process.env.ALIGO_PROXY_SECRET?.trim() || null,
  };
}

/** 템플릿 본문의 #{변수}를 값으로 치환합니다. */
function applyVars(message: string, vars?: Record<string, string>): string {
  if (!vars) return message;
  return message.replace(/#\{([^}]+)\}/g, (_, key) => vars[key.trim()] ?? `#{${key}}`);
}

export type SendAlimtalkResult = { success: true } | { success: false; message: string };

export type SendAlimtalkParams = {
  /** 수신자 전화번호 (여러 명 가능, 하이픈 유무 무관, 최대 500명) */
  receivers: string | string[];
  template: AlimtalkTemplateKey;
  /** 템플릿 변수 치환 (#{이름} → 값). 승인된 템플릿 본문과 일치해야 발송됩니다. */
  vars?: Record<string, string>;
  /** 알림톡 상단 강조 제목 (기본 "알림") */
  subject?: string;
};

export async function sendAlimtalk({
  receivers,
  template,
  vars,
  subject,
}: SendAlimtalkParams): Promise<SendAlimtalkResult> {
  const config = getAligoConfig();
  if (!config) {
    console.warn("[알림톡] 알리고 환경변수 미설정 — 발송 스킵");
    return { success: false, message: "알림톡 설정이 없습니다." };
  }

  const tpl = ALIMTALK_TEMPLATES[template];
  const { tplCode, message } = tpl;
  const button = "button" in tpl ? tpl.button : null;
  if (!tplCode || !message) {
    // 카카오 검수 승인 전 상태. 호출부는 실패로 취급하지 말고 넘어가면 됩니다.
    console.warn(`[알림톡] 템플릿 ${template} 검수 대기 중(코드 미기입) — 발송 스킵`);
    return { success: false, message: "템플릿이 아직 승인되지 않았습니다." };
  }

  const list = (Array.isArray(receivers) ? receivers : [receivers])
    .map((phone) => phone.replace(/\D/g, ""))
    .filter((phone) => phone.length >= 10);
  if (list.length === 0) {
    return { success: false, message: "수신자가 없습니다." };
  }

  const body = applyVars(message, vars);
  const payload: Record<string, string> = {
    apikey: config.apiKey,
    userid: config.userId,
    senderkey: config.senderKey,
    tpl_code: tplCode,
    sender: config.sender,
    failover: "N",
  };
  list.forEach((phone, i) => {
    payload[`receiver_${i + 1}`] = phone;
    payload[`subject_${i + 1}`] = subject ?? "알림";
    payload[`message_${i + 1}`] = body;
    // 템플릿에 버튼이 있으면 버튼 구성까지 승인 내용과 일치해야 발송됩니다.
    if (button) payload[`button_${i + 1}`] = JSON.stringify(button);
  });

  let result: { code: number; message: string };
  try {
    if (config.proxyUrl && config.proxySecret) {
      const response = await fetch(`${config.proxyUrl}/alimtalk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-proxy-secret": config.proxySecret,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      result = await response.json();
    } else {
      const response = await fetch(ALIGO_ALIMTALK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload).toString(),
        cache: "no-store",
      });
      result = await response.json();
    }
  } catch (error) {
    console.error("[알림톡] 요청 실패", error);
    return { success: false, message: "알림톡 발송에 실패했습니다." };
  }

  if (Number(result.code) !== 0) {
    // 응답에 발신 프로필·수신번호가 담기므로 서버 로그에만 남깁니다.
    console.error("[알림톡] 발송 실패", result.code, result.message);
    return { success: false, message: `알림톡 발송 실패: ${result.message}` };
  }

  console.log(`[알림톡] ${template} 발송 성공 (${list.length}명)`);
  return { success: true };
}
