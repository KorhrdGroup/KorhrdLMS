"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import {
  CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS,
  type CertificatePrepaymentUsageFilter,
} from "@/features/certificate-prepayments/constants";
import {
  buildCertificatePrepaymentQueryString,
  type CertificatePrepaymentListQuery,
} from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

type CertificatePrepaymentListToolbarProps = {
  query: CertificatePrepaymentListQuery;
  className?: string;
  onRegisterClick?: () => void;
};

export function CertificatePrepaymentListToolbar({
  query,
  className,
  onRegisterClick,
}: CertificatePrepaymentListToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(next: Partial<CertificatePrepaymentListQuery>) {
    startTransition(() => {
      router.push(
        `/admin/payments/prepayments${buildCertificatePrepaymentQueryString(next, query)}`,
      );
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    const usage = String(formData.get("usage") ?? "all") as CertificatePrepaymentUsageFilter;

    navigate({ page: 1, search, usage });
  }

  return (
    <div className={cn("space-y-4", className)}>
      <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleSearchSubmit}>
        <label className="space-y-1.5">
          <span className="block text-sm font-medium text-[#374151]">사용여부</span>
          <select
            name="usage"
            defaultValue={query.usage}
            className={cn(selectClassName, "w-full")}
            disabled={isPending}
          >
            {Object.entries(CERTIFICATE_PREPAYMENT_USAGE_FILTER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="block text-sm font-medium text-[#374151]">학생명/아이디/연락처 검색</span>
          <AdminInput
            name="search"
            variant="outline"
            defaultValue={query.search}
            placeholder="학생명, 아이디, 연락처"
            disabled={isPending}
          />
        </label>

        <div className="flex items-end justify-end gap-2">
          <AdminButton type="submit" disabled={isPending}>
            <Search className="size-4" />
            검색
          </AdminButton>
          <AdminButton type="button" variant="outline" onClick={onRegisterClick}>
            <Plus className="size-4" />
            선납결제 등록
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
