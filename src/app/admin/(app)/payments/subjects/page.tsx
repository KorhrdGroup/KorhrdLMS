import type { Metadata } from "next";

import { SubjectPaymentListView } from "@/features/payments/components/subject-payment-list-view";
import { parseSubjectPaymentListQuery } from "@/features/payments/lib/subject-payment-list-query";
import { getSubjectPaymentList } from "@/features/payments/services/subject-payment-list.service";

export const metadata: Metadata = {
  title: "전체결제",
};

type SubjectPaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubjectPaymentsPage({
  searchParams,
}: SubjectPaymentsPageProps) {
  const params = await searchParams;
  const query = parseSubjectPaymentListQuery(params);

  let result: Awaited<ReturnType<typeof getSubjectPaymentList>> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await getSubjectPaymentList(query);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "결제 목록을 불러오지 못했습니다.";
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">전체결제</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{errorMessage}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  return <SubjectPaymentListView result={result} query={query} />;
}
