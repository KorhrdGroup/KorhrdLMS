import type { Metadata } from "next";

import { MessageDispatchListView } from "@/features/others/message-center/components/message-dispatch-list-view";
import { parseMessageDispatchListQuery } from "@/features/others/message-center/lib/message-dispatch-list-query";
import { getMessageDispatchList } from "@/features/others/message-center/services/message-dispatch-list.service";

export const metadata: Metadata = {
  title: "메시지센터 | 운영관리",
};

type MessageCenterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MessageCenterPage({ searchParams }: MessageCenterPageProps) {
  const params = await searchParams;
  const query = parseMessageDispatchListQuery(params);

  try {
    const result = await getMessageDispatchList(query);

    return <MessageDispatchListView result={result} query={query} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "발송 내역을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">메시지센터</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
