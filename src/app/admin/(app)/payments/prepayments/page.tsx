import type { Metadata } from "next";

import { CertificatePrepaymentListView } from "@/features/certificate-prepayments/components/certificate-prepayment-list-view";
import { parseCertificatePrepaymentListQuery } from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";
import { getCertificatePrepaymentList } from "@/features/certificate-prepayments/services/certificate-prepayment-list.service";

export const metadata: Metadata = {
  title: "선납결제",
};

type PaymentPrepaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PaymentPrepaymentsPage({
  searchParams,
}: PaymentPrepaymentsPageProps) {
  const params = await searchParams;
  const query = parseCertificatePrepaymentListQuery(params);

  let result: Awaited<ReturnType<typeof getCertificatePrepaymentList>> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await getCertificatePrepaymentList(query);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "선납결제 목록을 불러오지 못했습니다.";
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">선납결제</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{errorMessage}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return <CertificatePrepaymentListView result={result} query={query} />;
}
