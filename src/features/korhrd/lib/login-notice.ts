import { getMyLectureData } from "@/features/korhrd/lib/my-lecture-data";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus } from "@/types/database.types";

/**
 * 메인 알림 팝업에 띄울 "다음에 할 일" 안내.
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
 * 신청(③)·재응시(②)·응시(①) 순입니다. 같은 경우에 과정이 여럿이면 과정명을
 * 쉼표로 이어 한 문장으로 안내하고, 버튼은 과정별 화면 대신 **나의 강의실**
 * (④는 통합 화면인 발급 내역)으로 보냅니다.
 */
export type LoginNoticeKind = "exam-ready" | "exam-retry" | "cert-apply" | "cert-payment";

export type LoginNoticeData = {
  kind: LoginNoticeKind;
  /** ①②는 시험, ③④는 발급 안내 */
  title: string;
  /** 과정명(④는 자격증명) — 화면에서 쉼표로 이어 붙입니다 */
  courses: string[];
  /** 과정명 뒤에 이어지는 문구 */
  message: string;
  href: string;
  action: string;
};

/** 우선순위 순서(④ → ③ → ② → ①)와 경우별 제목·문구·버튼 */
const NOTICE_BY_KIND: Record<
  LoginNoticeKind,
  Omit<LoginNoticeData, "kind" | "courses">
> = {
  "cert-payment": {
    title: "자격증 발급 안내",
    message: "입금 확인 후 자격증 제작이 시작됩니다.",
    href: "/certificate/status",
    action: "입금 안내 보기",
  },
  "cert-apply": {
    title: "자격증 발급 안내",
    message: "합격했습니다! 자격증 발급을 신청하세요.",
    href: "/mylecture",
    action: "발급 신청하기",
  },
  "exam-retry": {
    title: "자격증 시험 안내",
    message: "수료시험에 재응시하실 수 있습니다.",
    href: "/mylecture",
    action: "재응시하기",
  },
  "exam-ready": {
    title: "자격증 시험 안내",
    message: "수료시험 응시가 가능합니다.",
    href: "/mylecture",
    action: "시험 응시하기",
  },
};

export async function getLoginNotice(memberId: string): Promise<LoginNoticeData | null> {
  const [data, unpaidCertNames] = await Promise.all([
    getMyLectureData(memberId),
    findUnpaidCertificateNames(memberId),
  ]);

  const coursesByKind: Record<LoginNoticeKind, string[]> = {
    "cert-payment": unpaidCertNames,
    "cert-apply": [],
    "exam-retry": [],
    "exam-ready": [],
  };

  for (const e of data.active) {
    if (!data.courseCodeByName[e.course]) continue;
    if (e.status === "pass") coursesByKind["cert-apply"].push(e.course);
    else if (e.status === "fail") coursesByKind["exam-retry"].push(e.course);
    else if (e.status === "ready") coursesByKind["exam-ready"].push(e.course);
  }

  // 우선순위가 가장 높은 한 가지 경우만 (Record 선언 순서 = 우선순위)
  for (const kind of Object.keys(coursesByKind) as LoginNoticeKind[]) {
    const courses = coursesByKind[kind];
    if (courses.length > 0) {
      return { kind, courses, ...NOTICE_BY_KIND[kind] };
    }
  }
  return null;
}

/** ④ 발급 신청은 했으나 아직 입금 전인 자격증명 (취소 건 제외) */
async function findUnpaidCertificateNames(memberId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("certificate_applications")
    .select("certificate_name, payment_status")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .neq("delivery_status", "canceled")
    .in("payment_status", ["unpaid", "partial"] satisfies PaymentStatus[]);

  return ((data ?? []) as { certificate_name: string }[]).map((row) => row.certificate_name);
}
