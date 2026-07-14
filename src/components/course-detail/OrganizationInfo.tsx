import type { OrganizationInfoData } from "@/components/course-detail/types";
import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function OrganizationInfo({ organization }: { organization: OrganizationInfoData }) {
  const rows: { label: string; value: string }[] = [
    { label: "자격관리기관", value: organization.name },
    { label: "대표", value: organization.ceo },
    { label: "연락처", value: organization.contact },
    { label: "주소", value: organization.address },
  ];

  return (
    <div>
      <h2 className={cn("mb-3 text-[18px] font-bold", figmaClass.textPrimary)}>자격관리기관 정보</h2>
      <div className={cn("overflow-hidden border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {rows.map((row) => (
          <div key={row.label} className="flex divide-x border-b last:border-b-0" style={{ borderColor: "#e0e0e0" }}>
            <div className="w-[140px] shrink-0 bg-[#f7f8fa] px-4 py-3 text-[13px] font-semibold text-[#3d3d3d]">
              {row.label}
            </div>
            <div className={cn("flex-1 px-4 py-3 text-[14px]", figmaClass.textBody)}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
