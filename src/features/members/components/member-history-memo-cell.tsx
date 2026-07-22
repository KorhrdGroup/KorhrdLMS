"use client";

import { useState, useTransition } from "react";

import { updateMemberMemoAction } from "@/features/members/actions/member-edit.actions";
import { M } from "@/features/members/lib/member-design";

type MemberHistoryMemoCellProps = {
  memberId: string;
  memo: string | null;
};

/**
 * 회원목록 "회원정보이력" 컬럼. 목록에서 바로 관리자 메모를 입력/저장합니다.
 * 회원수정 모달의 "메모"(members.memo)와 같은 컬럼을 공유합니다.
 */
export function MemberHistoryMemoCell({ memberId, memo }: MemberHistoryMemoCellProps) {
  const [savedValue, setSavedValue] = useState(memo ?? "");
  const [value, setValue] = useState(memo ?? "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
      setFeedback({ type: "success", text: "저장됨" });
    });
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFeedback(null);
          }}
          placeholder="관리 메모"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "7px 10px",
            border: `1px solid ${M.line}`,
            borderRadius: 7,
            fontSize: 12,
            color: M.text,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          style={{
            flex: "none",
            padding: "7px 12px",
            borderRadius: 7,
            border: "none",
            background: isDirty && !isSaving ? M.accent : M.hover,
            color: isDirty && !isSaving ? "#fff" : M.body,
            fontSize: 12,
            cursor: isDirty && !isSaving ? "pointer" : "default",
          }}
        >
          {isSaving ? "저장 중" : "저장"}
        </button>
      </div>
      {feedback ? (
        <span
          style={{
            display: "block",
            marginTop: 3,
            fontSize: 11,
            color: feedback.type === "error" ? "#ef4444" : M.accentDim,
          }}
        >
          {feedback.text}
        </span>
      ) : null}
    </div>
  );
}
