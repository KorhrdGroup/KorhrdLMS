"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  MESSAGE_CHANNEL_FILTER_OPTIONS,
  MESSAGE_CHANNEL_LABELS,
  MESSAGE_DISPATCH_TYPE_FILTER_OPTIONS,
  MESSAGE_DISPATCH_TYPE_LABELS,
  MESSAGE_QUICK_PERIOD_OPTIONS,
  MESSAGE_SEND_STATUS_FILTER_OPTIONS,
  MESSAGE_SEND_STATUS_LABELS,
} from "@/features/others/message-center/constants";
import {
  buildMessageDispatchListQueryString,
  resolveQuickPeriodRange,
} from "@/features/others/message-center/lib/message-dispatch-list-query";
import type { MessageDispatchListQuery } from "@/features/others/message-center/types/message-dispatch.types";

const inputBox: CSSProperties = {
  height: 38,
  width: "100%",
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

const labelText: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: M.body,
  marginBottom: 6,
};

type MessageDispatchListToolbarProps = {
  query: MessageDispatchListQuery;
};

export function MessageDispatchListToolbar({ query }: MessageDispatchListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<MessageDispatchListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/others/message-center${buildMessageDispatchListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    navigate({
      page: 1,
      channel: String(formData.get("channel") ?? "").trim() as MessageDispatchListQuery["channel"],
      dispatchType: String(formData.get("dispatchType") ?? "").trim() as MessageDispatchListQuery["dispatchType"],
      status: String(formData.get("status") ?? "").trim() as MessageDispatchListQuery["status"],
      quickPeriod: "",
      startDate: String(formData.get("startDate") ?? "").trim(),
      endDate: String(formData.get("endDate") ?? "").trim(),
      search: String(formData.get("search") ?? "").trim(),
    });
  }

  function handleQuickPeriodClick(quickPeriod: MessageDispatchListQuery["quickPeriod"]) {
    const range = resolveQuickPeriodRange(quickPeriod);
    navigate({
      page: 1,
      quickPeriod,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", paddingBottom: 16 }}
    >
      <label>
        <span style={labelText}>채널</span>
        <select name="channel" defaultValue={query.channel} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {MESSAGE_CHANNEL_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {MESSAGE_CHANNEL_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span style={labelText}>발송유형</span>
        <select name="dispatchType" defaultValue={query.dispatchType} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {MESSAGE_DISPATCH_TYPE_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {MESSAGE_DISPATCH_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span style={labelText}>발송상태</span>
        <select name="status" defaultValue={query.status} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {MESSAGE_SEND_STATUS_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {MESSAGE_SEND_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        <span style={labelText}>기간 빠른검색</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MESSAGE_QUICK_PERIOD_OPTIONS.map((option) => {
            const active = query.quickPeriod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isPending}
                onClick={() => handleQuickPeriodClick(option.value)}
                style={{
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isPending ? "wait" : "pointer",
                  background: active ? M.accent : "#fff",
                  color: active ? "#fff" : M.text,
                  border: active ? "none" : `1px solid ${M.border}`,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </label>

      <label>
        <span style={labelText}>시작일</span>
        <input name="startDate" type="date" defaultValue={query.startDate} disabled={isPending} style={inputBox} />
      </label>

      <label>
        <span style={labelText}>종료일</span>
        <input name="endDate" type="date" defaultValue={query.endDate} disabled={isPending} style={inputBox} />
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        <span style={labelText}>검색</span>
        <input name="search" defaultValue={query.search} placeholder="수신자, 내용, 제목 검색" disabled={isPending} style={inputBox} />
      </label>

      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            height: 38,
            padding: "0 18px",
            borderRadius: 8,
            background: M.ink,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          검색
        </button>
      </div>
    </form>
  );
}
