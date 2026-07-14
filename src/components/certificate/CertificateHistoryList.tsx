import { figmaClass } from "@/components/home/home-design";
import type { MyCertificateApplicationItem } from "@/features/certificate-applications/types/certificate-application.types";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_TONE: Record<string, string> = {
  unpaid: "bg-[#f0f0f0] text-[#6b7280]",
  paid: "bg-[#e5f6ec] text-[#0f9d58]",
  partial: "bg-[#fef3c7] text-[#d97706]",
  refunded: "bg-[#fdeeee] text-[#e5433f]",
  canceled: "bg-[#f0f0f0] text-[#9ca3af]",
};

const DELIVERY_STATUS_TONE: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  preparing: "bg-[#dbeafe] text-[#1d4ed8]",
  shipped: "bg-[#e0e7ff] text-[#4338ca]",
  delivered: "bg-[#e5f6ec] text-[#0f9d58]",
  canceled: "bg-[#fdeeee] text-[#e5433f]",
};

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold", tone)}>{label}</span>
  );
}

export function CertificateHistoryList({ items }: { items: MyCertificateApplicationItem[] }) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-2 border px-6 py-20 text-center",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
          figmaClass.whiteBg,
        )}
      >
        <p className={cn("text-[15px] font-bold", figmaClass.textPrimary)}>신청한 자격증이 없습니다.</p>
        <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>
          자격증발급신청 메뉴에서 수료 완료한 과정의 자격증을 신청할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn("border p-5", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>{item.certificateName}</p>
              <p className={cn("mt-1 text-[13px]", figmaClass.textPlaceholder)}>신청일 {item.appliedAt}</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[12px]", figmaClass.textPlaceholder)}>결제상태</span>
                <StatusBadge
                  label={item.paymentStatusLabel}
                  tone={PAYMENT_STATUS_TONE[item.paymentStatus] ?? "bg-[#f0f0f0] text-[#6b7280]"}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[12px]", figmaClass.textPlaceholder)}>발급상태</span>
                <StatusBadge
                  label={item.deliveryStatusLabel}
                  tone={DELIVERY_STATUS_TONE[item.deliveryStatus] ?? "bg-[#f0f0f0] text-[#6b7280]"}
                />
              </div>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className={figmaClass.textPlaceholder}>배송상태</dt>
              <dd className={figmaClass.textBody}>{item.fullAddress}</dd>
            </div>
            <div className="flex gap-2">
              <dt className={figmaClass.textPlaceholder}>발급일</dt>
              <dd className={figmaClass.textBody}>{item.issuedAt ? item.issuedAt.slice(0, 10) : "미발급"}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
