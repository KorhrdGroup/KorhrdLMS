import { getMyLectureData } from "@/features/korhrd/lib/my-lecture-data";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/database.types";

/**
 * 로그인 알림 팝업에 띄울 "다음에 할 일" 목록.
 *
 * 수강 상태 판정은 나의 강의실과 같은 데이터(getMyLectureData)를 그대로 씁니다 —
 * 카드 상태와 팝업이 서로 다른 말을 하면 안 되기 때문입니다. 네 가지만 고릅니다.
 *
 *   ① 출석 60% 이상(수강 완료 포함)인데 시험 미응시  → status 'ready'
 *   ② 시험 불합격 후 재응시 전                       → status 'fail'
 *   ③ 합격 후 자격증 발급 신청 전                    → status 'pass'
 *   ④ 발급 신청 후 입금 전                           → certificate_applications.payment_status
 *
 * 한 번에 **한 가지 경우만** 띄웁니다. 결제(④)가 가장 급하고, 그다음이 발급
 * 신청(③)·재응시(②)·응시(①) 순입니다 — 여러 경우에 해당해도 우선순위가 가장
 * 높은 경우의 항목만 돌려줍니다. (같은 경우의 과정이 여럿이면 함께 보여줍니다)
 */
export type LoginNoticeItem = {
  kind: "exam-ready" | "exam-retry" | "cert-apply" | "cert-payment";
  /** 과정명(④는 자격증명) */
  course: string;
  message: string;
  href: string;
  /** 이동 버튼 글귀 */
  action: string;
};

const md = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
};

export async function getLoginNotices(memberId: string): Promise<LoginNoticeItem[]> {
  const [data, unpaid] = await Promise.all([
    getMyLectureData(memberId),
    findUnpaidCertificates(memberId),
  ]);

  const items: LoginNoticeItem[] = [];

  for (const e of data.active) {
    const code = data.courseCodeByName[e.course];
    if (!code) continue;

    if (e.status === "ready") {
      items.push({
        kind: "exam-ready",
        course: e.course,
        message:
          e.progress >= 100
            ? "수강을 모두 마쳤습니다. 수료시험에 응시해보세요!"
            : "시험 응시 조건(출석 60%)을 달성했습니다. 수료시험에 응시해보세요!",
        href: `/exam/${code}`,
        action: "시험 응시하기",
      });
    } else if (e.status === "fail") {
      items.push({
        kind: "exam-retry",
        course: e.course,
        message: "아쉽게 합격 기준에 도달하지 못했습니다. 재응시로 다시 도전해보세요!",
        href: `/exam/${code}`,
        action: "재응시하기",
      });
    } else if (e.status === "pass") {
      items.push({
        kind: "cert-apply",
        course: e.course,
        message: e.issueDeadline
          ? `합격을 축하드립니다! ${md(e.issueDeadline)}까지 자격증 발급을 신청하세요.`
          : "합격을 축하드립니다! 자격증 발급을 신청하세요.",
        href: `/certificate?course=${encodeURIComponent(e.course)}`,
        action: "발급 신청하기",
      });
    }
  }

  for (const cert of unpaid) {
    items.push({
      kind: "cert-payment",
      course: cert.certificateName,
      message: "발급 신청이 접수되었습니다. 입금이 확인되면 자격증 제작이 시작됩니다.",
      href: "/certificate/status",
      action: "입금 안내 보기",
    });
  }

  // 우선순위가 가장 높은 한 가지 경우만 남깁니다 (④ → ③ → ② → ①)
  const PRIORITY: LoginNoticeItem["kind"][] = [
    "cert-payment",
    "cert-apply",
    "exam-retry",
    "exam-ready",
  ];
  for (const kind of PRIORITY) {
    const picked = items.filter((item) => item.kind === kind);
    if (picked.length > 0) return picked;
  }
  return [];
}

/** ④ 발급 신청은 했으나 아직 입금 전인 자격증 (취소 건 제외) */
async function findUnpaidCertificates(memberId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificate_applications")
    .select("certificate_name, payment_status")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .neq("delivery_status", "canceled")
    .in("payment_status", ["unpaid", "partial"] satisfies PaymentStatus[]);

  return ((data ?? []) as { certificate_name: string }[]).map((row) => ({
    certificateName: row.certificate_name,
  }));
}
