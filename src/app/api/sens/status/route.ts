import { getSensConfig } from "@/lib/sens/sms";

/**
 * SENS 설정 점검용. PayApp(`/api/payapp/status`)과 같은 이유로 둡니다 —
 * 배포 환경변수가 실제로 들어갔는지 문자를 보내보지 않고 확인할 방법이 필요합니다.
 * **값이 아니라 있고 없음(true/false)만** 알려줍니다.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const config = getSensConfig();
  const has = (name: string) => Boolean(process.env[name]?.trim());

  return Response.json({
    문자발송_가능: config !== null,
    환경변수: {
      SENS_SERVICE_ID: has("SENS_SERVICE_ID"),
      SENS_ACCESS_KEY: has("SENS_ACCESS_KEY"),
      SENS_SECRET_KEY: has("SENS_SECRET_KEY"),
      SENS_SENDER_PHONE: has("SENS_SENDER_PHONE"),
    },
    // 발신번호는 SENS에 사전 등록된 번호여야 해서 뒷자리만 확인용으로 보여줍니다.
    발신번호_끝4자리: config ? config.from.slice(-4) : null,
  });
}
