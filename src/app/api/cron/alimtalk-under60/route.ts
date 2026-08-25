import { bulkSendMemberAlimtalk } from "@/features/members/services/member-alimtalk.service";

/**
 * 수강률 60% 미만 수강 독려 알림톡 — 매주 월요일 오전 10시(KST) 자동 발송.
 * vercel.json 의 crons 가 이 주소를 부릅니다 (0 1 * * 1 UTC = KST 10:00).
 *
 * 대상: 수강기간이 남은 확정 수강이 있고, 모든 과정 진도율이 60% 미만인
 * 활성 회원 전체 (회원관리 일괄 발송의 "수강률 60% 미만"과 같은 계산).
 *
 * 인증: Vercel Cron 은 CRON_SECRET 환경변수가 있으면
 * Authorization: Bearer <CRON_SECRET> 헤더를 붙여 옵니다. 외부에서 아무나
 * 호출해 발송을 일으키지 못하게 반드시 설정해 두세요.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return Response.json({ ok: false, reason: "CRON_SECRET 미설정 — 발송 안 함" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, reason: "인증 실패" }, { status: 401 });
  }

  const result = await bulkSendMemberAlimtalk({
    template: "PROGRESS_UNDER_60",
    mode: "progress_under",
    memberIds: [],
    source: "",
    triggerSource: "cron_under60",
  });

  console.log(`[크론] 60% 미만 독려 알림톡: ${result.message}`);
  return Response.json({ ok: true, ...result });
}
