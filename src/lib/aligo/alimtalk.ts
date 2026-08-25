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
export {
  ALIMTALK_TEMPLATES,
  ALIMTALK_TEMPLATE_LABELS,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/templates";

import {
  ALIMTALK_TEMPLATES,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/templates";

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
  /** 발송 이력(alimtalk_logs) 기록용 — 어디서 보낸 것인지와 수신 회원 */
  log?: {
    trigger: string;
    memberId?: string | null;
    receiverName?: string | null;
  };
};

/** 발송 결과를 이력 테이블에 남깁니다 — 실패해도 발송 흐름에는 영향 없음 */
async function writeAlimtalkLog(
  log: NonNullable<SendAlimtalkParams["log"]>,
  template: AlimtalkTemplateKey,
  receiverPhone: string,
  success: boolean,
  failReason: string | null,
): Promise<void> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.from("alimtalk_logs").insert({
      member_id: log.memberId ?? null,
      receiver_phone: receiverPhone.replace(/\D/g, ""),
      receiver_name: log.receiverName ?? null,
      template_key: template,
      trigger_source: log.trigger,
      success,
      fail_reason: failReason,
    });
  } catch (error) {
    console.error("[알림톡] 이력 기록 실패:", error);
  }
}

export async function sendAlimtalk({
  receivers,
  template,
  vars,
  subject,
  log,
}: SendAlimtalkParams): Promise<SendAlimtalkResult> {
  const firstReceiver = Array.isArray(receivers) ? (receivers[0] ?? "") : receivers;
  const finish = async (result: SendAlimtalkResult): Promise<SendAlimtalkResult> => {
    if (log && firstReceiver) {
      await writeAlimtalkLog(
        log,
        template,
        firstReceiver,
        result.success,
        result.success ? null : result.message,
      );
    }
    return result;
  };
  const config = getAligoConfig();
  if (!config) {
    console.warn("[알림톡] 알리고 환경변수 미설정 — 발송 스킵");
    return finish({ success: false, message: "알림톡 설정이 없습니다." });
  }

  const tpl = ALIMTALK_TEMPLATES[template];
  const { tplCode, message } = tpl;
  const button = "button" in tpl ? tpl.button : null;
  if (!tplCode || !message) {
    // 카카오 검수 승인 전 상태. 호출부는 실패로 취급하지 말고 넘어가면 됩니다.
    console.warn(`[알림톡] 템플릿 ${template} 검수 대기 중(코드 미기입) — 발송 스킵`);
    return finish({ success: false, message: "템플릿이 아직 승인되지 않았습니다." });
  }

  const list = (Array.isArray(receivers) ? receivers : [receivers])
    .map((phone) => phone.replace(/\D/g, ""))
    .filter((phone) => phone.length >= 10);
  if (list.length === 0) {
    return finish({ success: false, message: "수신자가 없습니다." });
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
    return finish({ success: false, message: "알림톡 발송에 실패했습니다." });
  }

  if (Number(result.code) !== 0) {
    // 응답에 발신 프로필·수신번호가 담기므로 서버 로그에만 남깁니다.
    console.error("[알림톡] 발송 실패", result.code, result.message);
    return finish({ success: false, message: `알림톡 발송 실패: ${result.message}` });
  }

  console.log(`[알림톡] ${template} 발송 성공 (${list.length}명)`);
  return finish({ success: true });
}
