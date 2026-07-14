"use client";

import { Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
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
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type CertificateListToolbarProps = {
  query: CertificateListQuery;
  className?: string;
  onExportError?: (message: string) => void;
};

export function CertificateListToolbar({
  query,
  className,
  onExportError,
}: CertificateListToolbarProps) {
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
    <div className={cn("space-y-4", className)}>
      <form
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={handleSearchSubmit}
      >
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">자격증 종류</span>
          <select
            name="certificateKind"
            defaultValue={query.certificateKind}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            <option value="">전체</option>
            {CERTIFICATE_KIND_FILTER_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {CERTIFICATE_KIND_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2 xl:col-span-3">
          <span className="block text-sm font-medium text-[#374151]">기간 빠른검색</span>
          <div className="flex flex-wrap gap-2">
            {CERTIFICATE_QUICK_PERIOD_OPTIONS.map((option) => (
              <AdminButton
                key={option.value}
                type="button"
                variant={query.quickPeriod === option.value ? "primary" : "outline"}
                size="sm"
                disabled={isPending}
                onClick={() => handleQuickPeriodClick(option.value)}
              >
                {option.label}
              </AdminButton>
            ))}
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">시작일</span>
          <AdminInput
            name="startDate"
            type="date"
            variant="outline"
            defaultValue={query.startDate}
            disabled={isPending}
          />
        </label>

        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">종료일</span>
          <AdminInput
            name="endDate"
            type="date"
            variant="outline"
            defaultValue={query.endDate}
            disabled={isPending}
          />
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="block text-sm font-medium text-[#374151]">
            이름/아이디/연락처 검색
          </span>
          <AdminInput
            name="search"
            variant="outline"
            defaultValue={query.search}
            placeholder="이름, 아이디, 연락처"
            disabled={isPending}
          />
        </label>

        <div className="flex items-end gap-2">
          <AdminButton type="submit" disabled={isPending}>
            <Search className="size-4" />
            검색
          </AdminButton>
          <AdminButton
            type="button"
            variant="outline"
            disabled={isPending || isExporting}
            onClick={handleExcelDownload}
          >
            <Download className="size-4" />
            {isExporting ? "다운로드 중..." : "Excel 다운로드"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
