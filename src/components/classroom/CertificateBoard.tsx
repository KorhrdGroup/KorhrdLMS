"use client";

import { Award, Download, Printer } from "lucide-react";
import { useState, useTransition } from "react";

import { figma, figmaClass } from "@/components/home/home-design";
import { issueClassroomCertificateAction } from "@/features/classroom-certificates/actions/classroom-certificate.actions";
import type {
  ClassroomCertificateRecord,
  ClassroomCertificateStatus,
} from "@/features/classroom-certificates/types/classroom-certificate.types";
import { cn } from "@/lib/utils";

const INSTITUTION_NAME = "한평생직업훈련센터";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}년 ${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일`;
}

export function CertificateBoard({ slug, status }: { slug: string; status: ClassroomCertificateStatus }) {
  const [certificate, setCertificate] = useState<ClassroomCertificateRecord | null>(status.certificate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIssuing, startIssuing] = useTransition();

  function handleIssue() {
    setErrorMessage(null);
    startIssuing(async () => {
      const result = await issueClassroomCertificateAction(slug);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setCertificate({
        certificateNumber: result.item.certificateNumber ?? "",
        issuedAt: result.item.issuedAt ?? new Date().toISOString(),
        reissueCount: result.item.reissueCount,
      });
    });
  }

  if (!status.isCompleted) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 border px-6 py-20 text-center",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
          figmaClass.whiteBg,
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-[#fdeeee]">
          <Award className="size-6 text-[#e5433f]" />
        </div>
        <p className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>아직 수료증을 발급받을 수 없습니다.</p>
        <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>
          아래 조건을 모두 충족하고 수강 기간이 종료되면 수료증을 발급받을 수 있습니다.
        </p>

        <div className="mt-2 flex w-full max-w-md flex-col gap-2 text-left">
          <ConditionRow
            label="진도율 60% 이상"
            detail={`현재 ${status.progressRate}%`}
            met={status.progressRate >= 60}
          />
          <ConditionRow
            label="시험 점수 60점 이상"
            detail={status.examPercent !== null ? `현재 ${status.examPercent}점` : "미응시"}
            met={status.examPercent !== null && status.examPercent >= 60}
          />
          <ConditionRow label="수강 기간 종료" detail={status.isPassed ? "합격 기준 충족" : "-"} met={status.isPassed} />
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 border px-6 py-20 text-center",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
          figmaClass.whiteBg,
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-[#e5edff]">
          <Award className="size-6" style={{ color: figma.colors.primary }} />
        </div>
        <p className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>수료증을 발급받을 수 있습니다.</p>
        <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>
          진도율·시험 점수 기준을 모두 충족했습니다. 아래 버튼을 눌러 수료증을 발급받으세요.
        </p>

        {errorMessage ? <p className="text-[13px] font-semibold text-[#e5433f]">{errorMessage}</p> : null}

        <button
          type="button"
          onClick={handleIssue}
          disabled={isIssuing}
          className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-lg px-6 text-[14px] font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-60"
          style={{ backgroundColor: figma.colors.primary }}
        >
          <Award className="size-4" />
          {isIssuing ? "발급 중..." : "수료증 발급"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body { background: #ffffff !important; }
        }
      `}</style>

      <div className="mb-5 flex justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className={cn(
            "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-4 text-[13px] font-semibold transition-all duration-200 hover:bg-[#f4f8ff] hover:text-[#00376e]",
            figmaClass.textSub,
            figmaClass.borderDefault,
          )}
        >
          <Printer className="size-4" />
          출력하기
        </button>
        <button
          type="button"
          onClick={() => window.alert("PDF 다운로드 기능은 준비 중입니다. 출력하기를 이용해주세요.")}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg px-4 text-[13px] font-bold text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: figma.colors.primary }}
        >
          <Download className="size-4" />
          PDF 다운로드
        </button>
      </div>

      <div
        className="mx-auto max-w-[720px] border-[3px] bg-white p-10 shadow-sm sm:p-14 print:max-w-none print:border-double print:border-black print:p-16 print:shadow-none"
        style={{ borderColor: figma.colors.primary }}
      >
        <div className="text-center">
          <p className="text-[12px] font-semibold tracking-[0.35em]" style={{ color: figma.colors.primary }}>
            CERTIFICATE OF COMPLETION
          </p>
          <h2 className="mt-3 text-[32px] font-black tracking-[0.5em]" style={{ color: figma.colors.primary }}>
            수료증
          </h2>
        </div>

        <div className="mx-auto mt-10 flex max-w-[440px] flex-col gap-4 text-[15px]">
          <CertificateRow label="과정명" value={status.courseTitle} />
          <CertificateRow label="수강생" value={status.studentName} />
          <CertificateRow label="수료일" value={formatDate(certificate.issuedAt)} />
          <CertificateRow label="수료번호" value={certificate.certificateNumber} />
        </div>

        <p className={cn("mx-auto mt-10 max-w-[480px] text-center text-[14px] leading-[1.9]", figmaClass.textBody)}>
          위 사람은 본원이 실시한 <strong>{status.courseTitle}</strong> 과정의 소정 교육과정을 이수 기준에 따라
          성실히 이수하였으므로 이 증서를 수여합니다.
        </p>

        <div className="mt-14 flex flex-col items-center gap-1.5">
          <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>{formatDate(certificate.issuedAt)}</p>
          <p className="text-[20px] font-bold" style={{ color: figma.colors.primary }}>
            {INSTITUTION_NAME}
          </p>
        </div>
      </div>
    </div>
  );
}

function CertificateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 border-b pb-3" style={{ borderColor: "#eee" }}>
      <span className={cn("w-20 shrink-0 text-[13px] font-semibold", figmaClass.textPlaceholder)}>{label}</span>
      <span className={cn("text-[16px] font-bold", figmaClass.textPrimary)}>{value}</span>
    </div>
  );
}

function ConditionRow({ label, detail, met }: { label: string; detail: string; met: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-2.5 text-[13px]",
        met ? "border-[#1a7d3c]/25 bg-[#1a7d3c]/5 text-[#1a7d3c]" : "border-[#e5433f]/25 bg-[#e5433f]/5 text-[#e5433f]",
      )}
    >
      <span className="font-semibold">{label}</span>
      <span>{detail}</span>
    </div>
  );
}
