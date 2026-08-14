import { ALIMTALK_TEMPLATES, getAligoConfig } from "@/lib/aligo/alimtalk";

/**
 * 알리고 알림톡 설정 점검용 (PayApp status와 같은 방식).
 *
 * 배포 환경변수가 실제로 들어갔는지, 고정 IP 프록시가 살아있는지를
 * 실제 발송 없이 확인합니다. **값이 아니라 있고 없음(true/false)만** 알려주고,
 * 키 같은 실제 값은 절대 내보내지 않습니다.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getAligoConfig();
  const has = (name: string) => Boolean(process.env[name]?.trim());

  // 프록시 /health는 인증 없이 열려 있어 발송 없이 생존만 확인할 수 있습니다.
  let 프록시_응답: boolean | "미설정" = "미설정";
  const proxyUrl = process.env.ALIGO_PROXY_URL?.trim().replace(/\/$/, "");
  if (proxyUrl) {
    try {
      const response = await fetch(`${proxyUrl}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      프록시_응답 = response.ok;
    } catch {
      프록시_응답 = false;
    }
  }

  return Response.json({
    발송가능: config !== null,
    프록시_경유: Boolean(config?.proxyUrl && config?.proxySecret),
    프록시_응답,
    환경변수: {
      ALIGO_API_KEY: has("ALIGO_API_KEY"),
      ALIGO_USER_ID: has("ALIGO_USER_ID"),
      ALIGO_SENDER_KEY: has("ALIGO_SENDER_KEY"),
      ALIGO_SENDER: has("ALIGO_SENDER"),
      ALIGO_PROXY_URL: has("ALIGO_PROXY_URL"),
      ALIGO_PROXY_SECRET: has("ALIGO_PROXY_SECRET"),
    },
    // 카카오 검수 승인 후 템플릿 코드가 기입됐는지
    템플릿: Object.fromEntries(
      Object.entries(ALIMTALK_TEMPLATES).map(([key, tpl]) => [
        key,
        tpl.tplCode ? tpl.tplCode : "검수 대기 (코드 미기입)",
      ]),
    ),
  });
}
