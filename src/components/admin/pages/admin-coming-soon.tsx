import { Construction } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/admin-card";

type AdminComingSoonProps = {
  title: string;
  description?: string;
  subNav?: React.ReactNode;
};

export function AdminComingSoon({
  title,
  description,
  subNav,
}: AdminComingSoonProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        description={description ?? "해당 메뉴는 현재 준비 중입니다."}
      />

      {subNav}

      <AdminCard>
        <AdminCardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
            <Construction className="size-6" />
          </span>
          <p className="text-lg font-bold text-[#111827]">준비중인 기능입니다</p>
          <p className="max-w-sm text-sm text-[#6B7280]">
            해당 기능은 추후 업데이트를 통해 제공될 예정입니다. 잠시만
            기다려주세요.
          </p>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
