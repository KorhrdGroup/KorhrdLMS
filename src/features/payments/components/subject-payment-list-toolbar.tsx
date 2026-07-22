"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  COURSE_PAYMENT_STATUS_FILTER_OPTIONS,
  COURSE_PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  SUBJECT_PAYMENT_QUICK_PERIOD_OPTIONS,
} from "@/features/payments/constants";
import {
  buildSubjectPaymentListQueryString,
  resolveQuickPeriodRange,
} from "@/features/payments/lib/subject-payment-list-query";
import type { SubjectPaymentListQuery } from "@/features/payments/types/subject-payment.types";

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

type SubjectPaymentListToolbarProps = {
  query: SubjectPaymentListQuery;
};

export function SubjectPaymentListToolbar({ query }: SubjectPaymentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<SubjectPaymentListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/payments/subjects${buildSubjectPaymentListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const endDate = String(formData.get("endDate") ?? "").trim();
    const memberName = String(formData.get("memberName") ?? "").trim();

    navigate({
      page: 1,
      paymentMethod: paymentMethod as SubjectPaymentListQuery["paymentMethod"],
      status: status as SubjectPaymentListQuery["status"],
      quickPeriod: "",
      startDate,
      endDate,
      memberName,
    });
  }

  function handleQuickPeriodClick(quickPeriod: SubjectPaymentListQuery["quickPeriod"]) {
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
        <span style={labelText}>결제방법</span>
        <select name="paymentMethod" defaultValue={query.paymentMethod} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span style={labelText}>상태</span>
        <select name="status" defaultValue={query.status} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {COURSE_PAYMENT_STATUS_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {COURSE_PAYMENT_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        <span style={labelText}>기간 빠른검색</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUBJECT_PAYMENT_QUICK_PERIOD_OPTIONS.map((option) => {
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
        <span style={labelText}>회원명 검색</span>
        <input name="memberName" defaultValue={query.memberName} placeholder="회원명 또는 아이디" disabled={isPending} style={inputBox} />
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
