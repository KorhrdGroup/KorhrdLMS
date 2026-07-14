import type { CourseInfoData } from "@/components/course-detail/types";
import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

function formatPrice(value: number) {
  return value.toLocaleString("ko-KR");
}

export function CourseInfo({ info }: { info: CourseInfoData }) {
  const rows: { label: string; value: string }[] = [
    { label: "담당교수", value: info.professor },
    { label: "강의형태", value: info.format },
    { label: "수업방식", value: info.method },
    { label: "강의시간", value: info.duration },
    {
      label: "수강료",
      value:
        info.tuitionFinal === 0
          ? `${formatPrice(info.tuitionOriginal)}원 → 무료`
          : `${formatPrice(info.tuitionOriginal)}원 → ${formatPrice(info.tuitionFinal)}원`,
    },
    { label: "자격증발급비", value: `${formatPrice(info.certFee)}원` },
  ];

  return (
    <div>
      <h2 className={cn("mb-3 text-[18px] font-bold", figmaClass.textPrimary)}>강의정보</h2>
      <dl className={cn("divide-y border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-4 px-4 py-3">
            <dt className={cn("w-[92px] shrink-0 text-[13px] font-medium", figmaClass.textPlaceholder)}>
              {row.label}
            </dt>
            <dd className={cn("text-[14px] font-medium", figmaClass.textBody)}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
