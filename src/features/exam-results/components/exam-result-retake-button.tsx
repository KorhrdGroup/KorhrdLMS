"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";

import { M } from "@/features/courses/lib/course-design";
import { allowExamRetakeAction } from "@/features/exam-results/actions/exam-result.actions";

type ExamResultRetakeButtonProps = {
  submissionId: string;
  retakeAllowed: boolean;
  onAllowed: () => void;
};

export function ExamResultRetakeButton({
  submissionId,
  retakeAllowed,
  onAllowed,
}: ExamResultRetakeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleClick() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await allowExamRetakeAction(submissionId);
      if (result.success) {
        onAllowed();
      } else {
        setErrorMessage(result.message);
      }
    });
  }

  if (retakeAllowed) {
    return (
      <button
        type="button"
        disabled
        style={{
          padding: "6px 10px",
          borderRadius: 7,
          fontSize: 12,
          background: "#fff",
          border: `1px solid ${M.border}`,
          color: M.mute,
          whiteSpace: "nowrap",
          cursor: "not-allowed",
        }}
      >
        허용됨
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 7,
          fontSize: 12,
          fontWeight: 600,
          background: "#fff",
          border: `1px solid ${M.border}`,
          color: M.text,
          whiteSpace: "nowrap",
          cursor: isPending ? "wait" : "pointer",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        <RotateCcw style={{ width: 14, height: 14 }} />
        재시험 허용
      </button>
      {errorMessage ? <p style={{ fontSize: 12, color: M.danger }}>{errorMessage}</p> : null}
    </div>
  );
}
