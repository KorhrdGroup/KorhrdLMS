import { redirect } from "next/navigation";

/**
 * "선납결제"는 자격증신청이 아니라 결제 관련 화면이라 "결제관리" 하위로
 * 이동했습니다(`/admin/payments/prepayments`). 관련 기능 코드(`src/features/certificate-prepayments`)와
 * DB 데이터(certificate_prepayments)는 그대로 유지하고, 이 구 URL로 직접 접근하는 경우만
 * 새 위치로 redirect합니다.
 */
export default function LegacyCertificatePrepaymentsPage() {
  redirect("/admin/payments/prepayments");
}
