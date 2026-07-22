"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import {
  CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS,
  type CertificatePrepaymentUsageFilter,
} from "@/features/certificate-prepayments/constants";
import {
  buildCertificatePrepaymentQueryString,
  type CertificatePrepaymentListQuery,
} from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";

const inputBox: CSSProperties = {
  height: 38,
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 13,
  color: M.text,
  outline: "none",
  background: "#fff",
};

type CertificatePrepaymentListToolbarProps = {
  query: CertificatePrepaymentListQuery;
  onRegisterClick?: () => void;
};

export function CertificatePrepaymentListToolbar({
  query,
  onRegisterClick,
}: CertificatePrepaymentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const usage = String(formData.get("usage") ?? "all") as CertificatePrepaymentUsageFilter;

    startTransition(() => {
      router.push(
        `/admin/payments/prepayments${buildCertificatePrepaymentQueryString({ page: 1, search, usage }, query)}`,
      );
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        paddingBottom: 16,
      }}
    >
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select name="usage" defaultValue={query.usage} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          {Object.entries(CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          name="search"
          defaultValue={query.search}
          placeholder="학생명, 아이디, 연락처 검색"
          disabled={isPending}
          style={{ ...inputBox, width: 280 }}
        />

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
      </form>

      <button
        type="button"
        onClick={onRegisterClick}
        style={{
          height: 38,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "0 18px",
          borderRadius: 8,
          background: M.accent,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
        선납결제 등록
      </button>
    </div>
  );
}
