"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";

import { AdminButton } from "@/components/admin/ui/admin-button";
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
      <AdminButton type="button" variant="outline" size="sm" disabled>
        허용됨
      </AdminButton>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <AdminButton type="button" variant="secondary" size="sm" onClick={handleClick} disabled={isPending}>
        <RotateCcw className="size-4" />
        재시험 허용
      </AdminButton>
      {errorMessage ? <p className="text-xs text-[#EF4444]">{errorMessage}</p> : null}
    </div>
  );
}
