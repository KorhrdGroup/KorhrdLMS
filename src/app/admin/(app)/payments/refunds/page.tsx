import { redirect } from "next/navigation";

/**
 * "환불관리" 소메뉴는 제거되었습니다(미구현 상태였던 준비중 화면). 이 구 URL로 직접
 * 접근하는 경우 "결제관리 > 전체결제"로 redirect합니다.
 */
export default function LegacyPaymentRefundsPage() {
  redirect("/admin/payments/subjects");
}
