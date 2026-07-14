import { Phone } from "lucide-react";
import Image from "next/image";

import { CUSTOMER_CENTER } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

type CustomerCenterProps = {
  className?: string;
};

export function CustomerCenter({ className }: CustomerCenterProps) {
  return (
    <div
      className={cn("w-full border bg-white px-6 py-6", figmaClass.roundedCard, className)}
      style={{ maxWidth: figma.layout.noticePanelWidth, borderColor: "#e4e4e4" }}
    >
      <h3 className={cn(figma.typography.cardTitle, "text-[20px]", figmaClass.textPrimary)}>고객센터</h3>

      <a
        href={`tel:${CUSTOMER_CENTER.phone.replace(/\./g, "")}`}
        className="mt-3 flex items-center gap-2 text-[#00376e]"
      >
        <Phone className="size-6 shrink-0" strokeWidth={2} />
        <span className="text-[26px] font-extrabold leading-none">{CUSTOMER_CENTER.phone}</span>
      </a>

      <div className={cn("mt-4 space-y-1 text-[13px]", figmaClass.textMuted)}>
        <p>
          운영시간 <span className={figmaClass.textBody}>{CUSTOMER_CENTER.hours}</span>
        </p>
        <p>
          휴무 일 <span className={figmaClass.textBody}>{CUSTOMER_CENTER.closedDays}</span>
        </p>
      </div>

      <div className={cn("mt-4 rounded-lg border-t px-1 py-5", figmaClass.borderDefault)}>
        <p className={cn("mb-3 text-[13px] font-semibold", figmaClass.textPrimary)}>
          자격취득 발급계좌안내
        </p>
        <div className="flex items-center gap-2">
          <Image
            src="/images/home/ic-bank.svg"
            alt={CUSTOMER_CENTER.bankName}
            width={90}
            height={24}
            className="h-[18px] w-auto shrink-0 object-contain"
          />
          <p className={cn("text-[13px]", figmaClass.textMuted)}>
            {CUSTOMER_CENTER.bankAccount} {CUSTOMER_CENTER.bankHolder}
          </p>
        </div>
      </div>
    </div>
  );
}
