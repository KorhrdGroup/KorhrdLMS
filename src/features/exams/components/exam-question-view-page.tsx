"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/layout/admin-shell";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/admin-button";
import { AdminCard, AdminCardContent } from "@/components/admin/ui/admin-card";
import { ExamQuestionViewQuestionList } from "@/features/exams/components/exam-question-view-question-list";
import { ExamQuestionViewSummary } from "@/features/exams/components/exam-question-view-summary";
import { ExamQuestionViewTotalsBar } from "@/features/exams/components/exam-question-view-totals-bar";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type {
  ExamQuestionViewItem,
  ExamQuestionViewSummary as ExamQuestionViewSummaryType,
  ExamQuestionViewTotals,
} from "@/features/exams/types/exam-question-view.types";
import { cn } from "@/lib/utils";

type ExamQuestionViewPageProps = {
  summary: ExamQuestionViewSummaryType;
  questions: ExamQuestionViewItem[];
  totals: ExamQuestionViewTotals;
};

export function ExamQuestionViewPage({
  summary,
  questions,
  totals,
}: ExamQuestionViewPageProps) {
  function handlePrintClick() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <AdminPageHeader
          title="문제보기"
          description="등록된 시험 문제를 확인하고 인쇄할 수 있습니다."
        />

        <div className="mt-6">
          <ExamSubNav />
        </div>
      </div>

      <div id="exam-question-print-area" className="space-y-6">
        <ExamQuestionViewSummary summary={summary} />

        <AdminCard className="print:border-none print:shadow-none">
          <AdminCardContent className="space-y-4 py-5">
            <ExamQuestionViewQuestionList questions={questions} />
            <ExamQuestionViewTotalsBar totals={totals} />
          </AdminCardContent>
        </AdminCard>
      </div>

      <div className="no-print flex flex-wrap justify-end gap-2">
        <Link
          href="/admin/exams/questions"
          className={cn(adminButtonVariants({ variant: "outline" }))}
        >
          목록으로
        </Link>
        <Link
          href={`/admin/exams/questions/${summary.examId}/items`}
          className={cn(adminButtonVariants({ variant: "secondary" }))}
        >
          수정
        </Link>
        <AdminButton type="button" onClick={handlePrintClick}>
          <Printer className="size-4" />
          인쇄
        </AdminButton>
      </div>
    </div>
  );
}
