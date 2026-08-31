import { bulkSendMemberAlimtalk } from "@/features/members/services/member-alimtalk.service";
import { claimWeeklyAlimtalkSend } from "@/features/others/alimtalk-test/services/weekly-alimtalk-settings.service";

/**
 * 수강률 60% 미만 수강 독려 알림톡 — 어드민이 설정한 요일·시각(KST)에 자동 발송.
 * vercel.json 의 crons 가 매시간 이 주소를 부르고, 발송 여부는
 * alimtalk_weekly_settings(운영관리 > 알림톡 테스트 화면에서 조정)를 보고 판단합니다.
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

  const claim = await claimWeeklyAlimtalkSend();
  if (!claim.send) {
    return Response.json({ ok: true, sent: false, reason: claim.reason });
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
