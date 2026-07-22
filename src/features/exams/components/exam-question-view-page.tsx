"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

import { M } from "@/features/courses/lib/course-design";
import { ExamQuestionViewQuestionList } from "@/features/exams/components/exam-question-view-question-list";
import { ExamQuestionViewSummary } from "@/features/exams/components/exam-question-view-summary";
import { ExamQuestionViewTotalsBar } from "@/features/exams/components/exam-question-view-totals-bar";
import { ExamSubNav } from "@/features/exams/components/exam-sub-nav";
import type {
  ExamQuestionViewItem,
  ExamQuestionViewSummary as ExamQuestionViewSummaryType,
  ExamQuestionViewTotals,
} from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewPageProps = {
  summary: ExamQuestionViewSummaryType;
  questions: ExamQuestionViewItem[];
  totals: ExamQuestionViewTotals;
};

const linkBtn = {
  height: 38,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "0 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
} as const;

export function ExamQuestionViewPage({
  summary,
  questions,
  totals,
}: ExamQuestionViewPageProps) {
  function handlePrintClick() {
    window.print();
  }

  return (
    <div
      style={{
        background: "#ffffff",
        color: M.text,
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div className="no-print">
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            시험문제 관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>문제보기</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>문제보기</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
            등록된 시험 문제를 확인하고 인쇄할 수 있습니다
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <ExamSubNav />
        </div>
      </div>

      <div id="exam-question-print-area" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <ExamQuestionViewSummary summary={summary} />

        <div>
          <ExamQuestionViewQuestionList questions={questions} />
          <div style={{ marginTop: 16 }}>
            <ExamQuestionViewTotalsBar totals={totals} />
          </div>
        </div>
      </div>

      <div
        className="no-print"
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 8, marginTop: 24 }}
      >
        <Link
          href="/admin/exams/questions"
          style={{ ...linkBtn, background: "#fff", border: `1px solid ${M.border}`, color: M.text }}
        >
          목록으로
        </Link>
        <Link
          href={`/admin/exams/questions/${summary.examId}/items`}
          style={{ ...linkBtn, background: "#fff", border: `1px solid ${M.border}`, color: M.text }}
        >
          수정
        </Link>
        <button
          type="button"
          onClick={handlePrintClick}
          style={{ ...linkBtn, background: M.accent, color: "#fff", border: "none", cursor: "pointer" }}
        >
          <Printer style={{ width: 16, height: 16 }} />
          인쇄
        </button>
      </div>
    </div>
  );
}
