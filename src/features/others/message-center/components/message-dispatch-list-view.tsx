"use client";

import { Send, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminListPagination } from "@/components/admin/ui/admin-list-pagination";
import { M } from "@/features/courses/lib/course-design";
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
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>메시지센터</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>메시지센터</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          발송 내역을 조회하고 발송을 준비할 수 있습니다 · 총 {result.total}개
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <OthersSubNav />
      </div>

      {successMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {successMessage}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <MessageDispatchListToolbar query={query} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 16 }}>
          <button
            type="button"
            onClick={() => setSingleOpen(true)}
            style={{
              height: 38,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 16px",
              borderRadius: 8,
              background: M.accent,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
            단건발송
          </button>
          <button
            type="button"
            onClick={() => setBulkOpen(true)}
            style={{
              height: 38,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 16px",
              borderRadius: 8,
              background: "#fff",
              color: M.text,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${M.border}`,
              cursor: "pointer",
            }}
          >
            <Users style={{ width: 16, height: 16 }} />
            대량발송 준비
          </button>
        </div>
      </div>

      <MessageDispatchListTable result={result} onDetailClick={handleDetailClick} />

      <div style={{ marginTop: 20 }}>
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
      </div>

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
