import type { Metadata } from "next";

import { AdminAccessListView } from "@/features/statistics/components/admin-access-list-view";
import { parseAdminAccessListQuery } from "@/features/statistics/lib/admin-access-list-query";
import { getAdminAccessList } from "@/features/statistics/services/admin-access-list.service";

export const metadata: Metadata = {
  title: "관리자 접속목록 | 통계/정보관리",
};

type AdminAccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminAccessPage({ searchParams }: AdminAccessPageProps) {
  const params = await searchParams;
  const query = parseAdminAccessListQuery(params);

  try {
    const result = await getAdminAccessList(query);

    return <AdminAccessListView result={result} query={query} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "관리자 접속 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">관리자 접속목록</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
