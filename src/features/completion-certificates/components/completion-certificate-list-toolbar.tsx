"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  CERTIFICATE_SEARCH_FIELD_LABELS,
  CERTIFICATE_STATUS_FILTER_LABELS,
} from "@/features/completion-certificates/constants";
import { buildCompletionCertificateListQueryString } from "@/features/completion-certificates/lib/completion-certificate-list-query";
import type {
  CertificateSearchField,
  CertificateStatusFilter,
  CompletionCertificateListQuery,
} from "@/features/completion-certificates/types/completion-certificate.types";
import { cn } from "@/lib/utils";

type CompletionCertificateListToolbarProps = {
  query: CompletionCertificateListQuery;
  className?: string;
};

export function CompletionCertificateListToolbar({
  query,
  className,
}: CompletionCertificateListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const field = String(formData.get("field") ?? "all") as CertificateSearchField;
    const status = String(formData.get("status") ?? "all") as CertificateStatusFilter;

    startTransition(() => {
      router.push(
        `/admin/certificates${buildCompletionCertificateListQueryString(
          { page: 1, search, field, status },
          query,
        )}`,
      );
    });
  }

  return (
    <form
      className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center", className)}
      onSubmit={handleSearchSubmit}
    >
      <select
        name="field"
        defaultValue={query.field}
        className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
      >
        {Object.entries(CERTIFICATE_SEARCH_FIELD_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <AdminInput
        name="search"
        variant="outline"
        defaultValue={query.search}
        placeholder="회원명, 아이디, 과정명으로 검색"
        className="sm:max-w-xs"
      />

      <select
        name="status"
        defaultValue={query.status}
        className="h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
      >
        {Object.entries(CERTIFICATE_STATUS_FILTER_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <AdminButton type="submit" disabled={isPending}>
        <Search className="size-4" />
        검색
      </AdminButton>
    </form>
  );
}
