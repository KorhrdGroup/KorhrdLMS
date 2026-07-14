"use client";

import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { updateMemberMemoAction } from "@/features/members/actions/member-edit.actions";
import { cn } from "@/lib/utils";

type MemberHistoryMemoCellProps = {
  memberId: string;
  memo: string | null;
};

/**
 * 회원목록 "회원정보이력" 컬럼. 회원수정 모달을 열지 않고도 목록에서 바로
 * 관리자 메모를 입력/수정/저장할 수 있게 합니다. 회원수정 모달의 "메모"
 * 필드(members.memo)와 동일한 컬럼을 공유합니다.
 */
export function MemberHistoryMemoCell({ memberId, memo }: MemberHistoryMemoCellProps) {
  const [savedValue, setSavedValue] = useState(memo ?? "");
  const [value, setValue] = useState(memo ?? "");
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);
  const [isSaving, startSaving] = useTransition();

  const isDirty = value !== savedValue;

  function handleSave() {
    setFeedback(null);
    startSaving(async () => {
      const result = await updateMemberMemoAction(memberId, value);

      if (!result.success) {
        setFeedback({ type: "error", text: result.message });
        return;
      }

      setSavedValue(value);
      setFeedback({ type: "success", text: "저장되었습니다." });
    });
  }

  return (
    <div
      className="flex w-40 flex-col gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setFeedback(null);
        }}
        placeholder="관리 메모를 입력하세요"
        rows={2}
        className="w-full resize-y rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30"
      />
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[11px]",
            feedback?.type === "error" ? "text-[#EF4444]" : "text-[#059669]",
          )}
        >
          {feedback?.text ?? "\u00A0"}
        </span>
        <AdminButton
          type="button"
          size="sm"
          className="h-7 px-2.5 text-xs"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "저장 중..." : "저장"}
        </AdminButton>
      </div>
    </div>
  );
}
