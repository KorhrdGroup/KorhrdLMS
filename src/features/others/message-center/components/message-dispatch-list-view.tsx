"use client";

import { Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import {
  AdminCard,
  AdminCardContent,
  AdminCardFooter,
} from "@/components/admin/ui/admin-card";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { OthersSubNav } from "@/features/others/components/others-sub-nav";
import { MessageBulkPrepareModal } from "@/features/others/message-center/components/message-bulk-prepare-modal";
import { MessageDispatchDetailModal } from "@/features/others/message-center/components/message-dispatch-detail-modal";
import { MessageDispatchListTable } from "@/features/others/message-center/components/message-dispatch-list-table";
import { MessageDispatchListToolbar } from "@/features/others/message-center/components/message-dispatch-list-toolbar";
import { MessageSingleSendModal } from "@/features/others/message-center/components/message-single-send-modal";
import { buildMessageDispatchPageHref } from "@/features/others/message-center/lib/message-dispatch-list-query";
import type {
  MessageDispatchListItem,
  MessageDispatchListQuery,
} from "@/features/others/message-center/types/message-dispatch.types";
import type { PaginatedResult } from "@/lib/shared/list-query";

type MessageDispatchListViewProps = {
  result: PaginatedResult<MessageDispatchListItem>;
  query: MessageDispatchListQuery;
};

export function MessageDispatchListView({ result, query }: MessageDispatchListViewProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailDispatchId, setDetailDispatchId] = useState<string | null>(null);
  const [singleOpen, setSingleOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleActionSuccess(message: string) {
    setSuccessMessage(message);
    router.refresh();
  }

  function handleDetailClick(item: MessageDispatchListItem) {
    setDetailDispatchId(item.id);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="메시지센터"
        description="메시지센터에서 발송 내역을 조회하고 발송을 준비할 수 있습니다."
      />

      <OthersSubNav />

      {successMessage ? (
        <p className="rounded-lg bg-[#ECFDF5] px-4 py-3 text-sm text-[#047857]">
          {successMessage}
        </p>
      ) : null}

      <AdminCard>
        <AdminCardContent className="space-y-4 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <MessageDispatchListToolbar query={query} />
            <div className="flex flex-wrap gap-2">
              <AdminButton type="button" onClick={() => setSingleOpen(true)}>
                <Send className="size-4" />
                단건발송
              </AdminButton>
              <AdminButton type="button" variant="secondary" onClick={() => setBulkOpen(true)}>
                <Users className="size-4" />
                대량발송 준비
              </AdminButton>
            </div>
          </div>
          <MessageDispatchListTable result={result} onDetailClick={handleDetailClick} />
        </AdminCardContent>
        <AdminCardFooter>
          <AdminListPagination
            page={result.page}
            totalPages={result.totalPages}
            totalItems={result.total}
            pageSize={result.pageSize}
            query={{
              page: query.page,
              pageSize: query.pageSize,
              search: query.search,
              field: "all",
            }}
            buildPageHref={(page) => buildMessageDispatchPageHref(page, query)}
            className="w-full"
          />
        </AdminCardFooter>
      </AdminCard>

      <MessageDispatchDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        dispatchId={detailDispatchId}
      />

      <MessageSingleSendModal
        open={singleOpen}
        onOpenChange={setSingleOpen}
        onSuccess={handleActionSuccess}
      />

      <MessageBulkPrepareModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
