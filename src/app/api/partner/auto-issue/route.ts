import { NextResponse } from "next/server";

import { runAutoIssue, type AutoIssueInput } from "@/features/partner-issue/auto-issue.service";

/**
 * 한평생 오피스 → 한직훈 자동 발급 신청.
 *
 * 오피스(학점연계 신청 상세)의 버튼이 서버끼리 호출합니다.
 * 비밀키(x-partner-key)가 유일한 방어선이므로 키가 등록돼 있지 않으면 아예 받지 않습니다.
 * 브라우저에서 직접 부르는 API가 아닙니다 — 키가 노출되면 안 됩니다.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.PARTNER_AUTO_ISSUE_KEY?.trim();
  if (!expected) {
    return NextResponse.json(
      { success: false, message: "PARTNER_AUTO_ISSUE_KEY 가 설정되지 않았습니다." },
      { status: 503 },
    );
  }

  if (request.headers.get("x-partner-key")?.trim() !== expected) {
    return NextResponse.json({ success: false, message: "인증 실패" }, { status: 401 });
  }

  let body: AutoIssueInput;
  try {
    body = (await request.json()) as AutoIssueInput;
  } catch {
    return NextResponse.json({ success: false, message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!body?.name?.trim() || !body?.birthDate?.trim() || !Array.isArray(body.certificates) || body.certificates.length === 0) {
    return NextResponse.json(
      { success: false, message: "이름·생년월일·신청 자격증이 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const result = await runAutoIssue(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[partner/auto-issue] 실패:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "자동 발급 처리에 실패했습니다." },
      { status: 500 },
    );
  }
}
