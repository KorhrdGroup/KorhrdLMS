import { Info } from "lucide-react";

import { figma, figmaClass } from "@/components/home/home-design";
import type { ClassroomGradeData } from "@/features/classroom-grades/types/classroom-grade.types";
import { cn } from "@/lib/utils";

const NOTICE_ITEMS = [
  "과목 이수인정 기준은 취득점수 60점 이상, 진도율 60% 이상인 과목만 이수인정 됩니다.",
  "취득점수가 60점 이상인 과목이라도 진도율이 60% 이상이 아니면 이수인정 되지 않습니다.",
  "총점 = 진도율 점수(40%) + 시험 점수(60%)로 계산됩니다.",
  "수료가능 상태는 수강 기간 중 현재 기준 합격 조건을 충족했음을 의미하며, 수강 기간이 종료되면 '수료'로 확정됩니다.",
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className={cn("mb-3 flex items-center gap-2 text-[15px] font-bold", figmaClass.textPrimary)}>
      <span className="h-3.5 w-1 rounded-sm" style={{ backgroundColor: figma.colors.primary }} />
      {children}
    </h3>
  );
}

function TableShell({ children, minWidth = 640 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
      <table className="w-full text-[13px]" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn("border-r py-3 text-center text-[12.5px] font-semibold text-[#3d3d3d] last:border-r-0", className)}
      style={{ borderColor: figma.colors.border }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td
      className={cn("border-r py-3 text-center last:border-r-0", figmaClass.textBody, className)}
      style={{ borderColor: figma.colors.border, ...style }}
    >
      {children}
    </td>
  );
}

function PassBadge({ isPassed }: { isPassed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold",
        isPassed ? "border-[#2563eb]/30 bg-[#2563eb]/5 text-[#2563eb]" : "border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]",
      )}
    >
      {isPassed ? "합격" : "불합격"}
    </span>
  );
}

function CertificationBadge({ status, label }: { status: ClassroomGradeData["summary"]["certificationStatus"]; label: string }) {
  const colorClass =
    status === "completed"
      ? "border-[#059669]/30 bg-[#059669]/5 text-[#059669]"
      : status === "eligible"
        ? "border-[#2563eb]/30 bg-[#2563eb]/5 text-[#2563eb]"
        : "border-[#e5433f]/30 bg-[#e5433f]/5 text-[#e5433f]";

  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold", colorClass)}>{label}</span>;
}

export function GradesBoard({ data }: { data: ClassroomGradeData }) {
  const { summary, exams } = data;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionHeading>성적보기</SectionHeading>
        <TableShell minWidth={880}>
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <Th>수강기간</Th>
              <Th>과목명</Th>
              <Th>결제</Th>
              <Th>진도율</Th>
              <Th>시험점수</Th>
              <Th>총점</Th>
              <Th>등급</Th>
              <Th>합격여부</Th>
              <Th>수료가능여부</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td className={figmaClass.textPlaceholder}>{summary.periodLabel}</Td>
              <Td className="font-semibold">{summary.subjectName}</Td>
              <Td>{summary.paymentStatusLabel}</Td>
              <Td>{summary.progressRate}%</Td>
              <Td>{summary.examScoreLabel}</Td>
              <Td className="font-bold" style={{ color: figma.colors.primary }}>
                {summary.totalScore}
              </Td>
              <Td className="font-bold">{summary.grade}</Td>
              <Td>
                <PassBadge isPassed={summary.isPassed} />
              </Td>
              <Td>
                <CertificationBadge status={summary.certificationStatus} label={summary.certificationStatusLabel} />
              </Td>
            </tr>
          </tbody>
        </TableShell>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#f7f8fa] px-5 py-4">
          <Info className="mt-0.5 size-4 shrink-0 text-[#919191]" />
          <ul className={cn("space-y-1.5 text-[12.5px] leading-relaxed", figmaClass.textMuted)}>
            {NOTICE_ITEMS.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <SectionHeading>학습진도</SectionHeading>
        <div className={cn("flex flex-col gap-5 border p-5 sm:p-6", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}>
          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
            <span className={cn("w-16 shrink-0 text-[13px] font-semibold", figmaClass.textSub)}>진도율</span>
            <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-[#eef0f3]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${summary.progressRate}%`, backgroundColor: "#e5433f" }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-[13px] font-bold" style={{ color: "#e5433f" }}>
              {summary.progressRate}%
            </span>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading>시험</SectionHeading>
        <TableShell>
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <Th>시험명</Th>
              <Th>시험 기간</Th>
              <Th>백분율 점수</Th>
              <Th>합격여부</Th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan={4} className={cn("py-10 text-center text-[13px]", figmaClass.textPlaceholder)}>
                  등록된 시험이 없습니다.
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id}>
                  <Td className="font-semibold">{exam.title}</Td>
                  <Td className={figmaClass.textPlaceholder}>{exam.periodLabel}</Td>
                  <Td className={figmaClass.textPlaceholder}>{exam.scorePercentLabel}</Td>
                  <Td>
                    {exam.isPassed == null ? (
                      <span className={figmaClass.textPlaceholder}>-</span>
                    ) : (
                      <PassBadge isPassed={exam.isPassed} />
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableShell>
      </section>
    </div>
  );
}
