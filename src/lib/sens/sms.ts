import { createHmac } from "node:crypto";

/**
 * 네이버 클라우드 플랫폼 SENS — SMS 발송.
 *
 * 콘솔 위치:
 *  · serviceId  : Console > Services > SENS > SMS > 프로젝트 상세 (ncp:sms:kr:...)
 *  · access/secret key : 마이페이지 > 계정관리 > 인증키 관리
 *  · from       : SENS에 **사전 등록·승인된 발신번호**만 됩니다(미등록 번호는 401/400).
 *
 * 서버 전용입니다. NEXT_PUBLIC_ 접두사를 붙이면 키가 브라우저로 새어 나갑니다.
 */
const API_HOST = "https://sens.apigw.ntruss.com";

export type SensConfig = {
  serviceId: string;
  accessKey: string;
  secretKey: string;
  from: string;
};

export function getSensConfig(): SensConfig | null {
  const serviceId = process.env.SENS_SERVICE_ID?.trim();
  const accessKey = process.env.SENS_ACCESS_KEY?.trim();
  const secretKey = process.env.SENS_SECRET_KEY?.trim();
  const from = process.env.SENS_SENDER_PHONE?.trim().replace(/\D/g, "");

  if (!serviceId || !accessKey || !secretKey || !from) {
    return null;
  }

  return { serviceId, accessKey, secretKey, from };
}

/**
 * API Gateway 서명(v2). 서명 대상 문자열의 개행·공백이 한 글자라도 다르면
 * 401이 떨어지므로 형식을 그대로 지킵니다.
 *   {method} {url}\n{timestamp}\n{accessKey}
 */
function sign(config: SensConfig, method: string, url: string, timestamp: string) {
  const message = `${method} ${url}\n${timestamp}\n${config.accessKey}`;
  return createHmac("sha256", config.secretKey).update(message).digest("base64");
}

export type SendSmsResult = { success: true } | { success: false; message: string };

export async function sendSms(to: string, content: string): Promise<SendSmsResult> {
  const config = getSensConfig();
  if (!config) {
    return {
      success: false,
      message: "문자 발송 설정이 없습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  const path = `/sms/v2/services/${config.serviceId}/messages`;
  const timestamp = String(Date.now());

  let response: Response;
  try {
    response = await fetch(`${API_HOST}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "x-ncp-apigw-timestamp": timestamp,
        "x-ncp-iam-access-key": config.accessKey,
        "x-ncp-apigw-signature-v2": sign(config, "POST", path, timestamp),
      },
      body: JSON.stringify({
        type: "SMS",
        contentType: "COMM",
        countryCode: "82",
        from: config.from,
        content,
        messages: [{ to: to.replace(/\D/g, "") }],
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[SENS] 요청 실패", error);
    return { success: false, message: "문자 발송에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  if (!response.ok) {
    // 응답 본문에 발신번호·요청 내용이 담기므로 서버 로그에만 남깁니다.
    console.error("[SENS] 발송 실패", response.status, await response.text());
    return { success: false, message: "문자 발송에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  return { success: true };
}
