import type { LicenseCardData } from "@/components/course-detail/types";
import { figma } from "@/components/home/home-design";

export function LicenseCard({ license }: { license: LicenseCardData }) {
  return (
    <div className="h-full rounded-[10px] p-5 text-center text-white" style={{ backgroundColor: figma.colors.primary }}>
      <p className="text-[14px] font-semibold text-white/80">민간자격등록 번호</p>
      <p className="mt-1 text-[24px] font-extrabold tracking-wide">{license.number}</p>
      <p className="mt-2 text-[13px] font-semibold text-[#ffe02f]">주무관청 {license.agency}</p>
      <p className="mt-3 text-[12px] leading-relaxed text-white/70">{license.description}</p>
      <a
        href={license.inquiryUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white/10 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-white/20"
      >
        {license.inquiryLabel}
      </a>
    </div>
  );
}
