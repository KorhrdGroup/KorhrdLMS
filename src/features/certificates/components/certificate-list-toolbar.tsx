"use client";

import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { exportCertificateApplicationsAction } from "@/features/certificates/actions/certificate.actions";
import {
  CERTIFICATE_KIND_FILTER_OPTIONS,
  CERTIFICATE_KIND_LABELS,
  CERTIFICATE_QUICK_PERIOD_OPTIONS,
} from "@/features/certificates/constants";
import {
  buildCertificateListQueryString,
  resolveQuickPeriodRange,
} from "@/features/certificates/lib/certificate-list-query";
import type { CertificateListQuery } from "@/features/certificates/types/certificate.types";

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

type CertificateListToolbarProps = {
  query: CertificateListQuery;
  onExportError?: (message: string) => void;
};

export function CertificateListToolbar({ query, onExportError }: CertificateListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isExporting, startExport] = useTransition();

  function navigate(next: Partial<CertificateListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/certificates/applications${buildCertificateListQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const certificateKind = String(formData.get("certificateKind") ?? "").trim();
    const startDate = String(formData.get("startDate") ?? "").trim();
    const endDate = String(formData.get("endDate") ?? "").trim();
    const search = String(formData.get("search") ?? "").trim();

    navigate({
      page: 1,
      certificateKind: certificateKind as CertificateListQuery["certificateKind"],
      quickPeriod: "",
      startDate,
      endDate,
      search,
    });
  }

  function handleQuickPeriodClick(quickPeriod: CertificateListQuery["quickPeriod"]) {
    const range = resolveQuickPeriodRange(quickPeriod);
    navigate({
      page: 1,
      quickPeriod,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  }

  function handleExcelDownload() {
    startExport(async () => {
      try {
        const result = await exportCertificateApplicationsAction(query);

        if (!result.success) {
          onExportError?.(result.message);
          return;
        }

        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        onExportError?.(
          error instanceof Error ? error.message : "Excel 다운로드에 실패했습니다.",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSearchSubmit}
      style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", paddingBottom: 16 }}
    >
      <label>
        <span style={labelText}>자격증 종류</span>
        <select name="certificateKind" defaultValue={query.certificateKind} disabled={isPending} style={{ ...inputBox, cursor: "pointer" }}>
          <option value="">전체</option>
          {CERTIFICATE_KIND_FILTER_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {CERTIFICATE_KIND_LABELS[value]}
            </option>
          ))}
        </select>
      </label>

      <label style={{ gridColumn: "1 / -1" }}>
        <span style={labelText}>기간 빠른검색</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CERTIFICATE_QUICK_PERIOD_OPTIONS.map((option) => {
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
        <span style={labelText}>이름/아이디/연락처 검색</span>
        <input name="search" defaultValue={query.search} placeholder="이름, 아이디, 연락처" disabled={isPending} style={inputBox} />
      </label>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
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
        <button
          type="button"
          disabled={isPending || isExporting}
          onClick={handleExcelDownload}
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
            cursor: isPending || isExporting ? "wait" : "pointer",
            opacity: isPending || isExporting ? 0.7 : 1,
          }}
        >
          <Download style={{ width: 14, height: 14 }} />
          {isExporting ? "다운로드 중..." : "Excel 다운로드"}
        </button>
      </div>
    </form>
  );
}
