"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useState, useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { deleteProfessorAction } from "@/features/professors/actions/professor.actions";
import { ProfessorFormModal } from "@/features/professors/components/professor-form-modal";
import { formatDate } from "@/lib/shared/format-date";
import type { ProfessorListItem } from "@/features/professors/types/professor.types";

type ProfessorListViewProps = {
  professors: ProfessorListItem[];
};

const GRID = "64px 140px 1fr 100px 110px 150px";

const headStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  alignItems: "center",
  gap: 12,
  borderTop: `1.5px solid ${M.ink}`,
  borderBottom: `1px solid ${M.line}`,
  padding: "11px 8px",
  fontSize: 12,
  color: M.mute,
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: GRID,
  alignItems: "center",
  gap: 12,
  borderBottom: `1px solid ${M.line}`,
  padding: "10px 8px",
  fontSize: 13,
  color: M.text,
};

const actionButtonStyle: CSSProperties = {
  padding: "6px 12px",
  borderRadius: 8,
  border: `1px solid ${M.border}`,
  background: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export function ProfessorListView({ professors }: ProfessorListViewProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProfessorListItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleActionSuccess(nextMessage: string) {
    setMessage(nextMessage);
    setErrorMessage(null);
    router.refresh();
  }

  function handleRegisterClick() {
    setMessage(null);
    setErrorMessage(null);
    setEditTarget(null);
    setFormOpen(true);
  }

  function handleEditClick(professor: ProfessorListItem) {
    setMessage(null);
    setErrorMessage(null);
    setEditTarget(professor);
    setFormOpen(true);
  }

  function handleDeleteClick(professor: ProfessorListItem) {
    // 담당 과정이 있으면 서버에서 거부되므로, 확인 창은 단순하게 유지합니다.
    if (!window.confirm(`"${professor.name}" 교수를 삭제할까요?`)) {
      return;
    }

    startDelete(async () => {
      const result = await deleteProfessorAction(professor.id);
      if (result.success) {
        handleActionSuccess(result.message);
      } else {
        setMessage(null);
        setErrorMessage(result.message);
      }
    });
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
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
            과정관리 <span style={{ margin: "0 4px" }}>/</span>
            <span style={{ color: M.ink, fontWeight: 600 }}>교수관리</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>교수관리</div>
          <div style={{ fontSize: 13, color: M.mute, marginTop: 4, maxWidth: 640 }}>
            담당 교수의 이력·사진을 관리합니다. 수정하면 담당 과정 전체의 상세페이지에 바로 반영됩니다.
          </div>
        </div>
        <button
          type="button"
          onClick={handleRegisterClick}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            background: M.ink,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          + 교수 등록
        </button>
      </div>

      {message ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: M.weakBg, color: M.weakFg, padding: "10px 14px", fontSize: 13 }}>
          {message}
        </div>
      ) : null}
      {errorMessage ? (
        <div style={{ marginBottom: 16, borderRadius: 8, background: "#FEF2F2", color: M.danger, padding: "10px 14px", fontSize: 13 }}>
          {errorMessage}
        </div>
      ) : null}

      {professors.length === 0 ? (
        <div style={{ minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: M.mute }}>
          등록된 교수가 없습니다. 교수 등록 버튼으로 새 교수를 추가하세요.
        </div>
      ) : (
        <div>
          <div style={headStyle}>
            <span>사진</span>
            <span>교수명</span>
            <span>이력</span>
            <span style={{ textAlign: "center" }}>담당 과정</span>
            <span>등록일</span>
            <span style={{ textAlign: "center" }}>관리</span>
          </div>

          {professors.map((professor) => (
            <div key={professor.id} style={rowStyle}>
              {professor.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={professor.photoUrl}
                  alt={professor.name}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: `1px solid ${M.line}` }}
                />
              ) : (
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: M.hover,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: M.mute,
                  }}
                >
                  없음
                </span>
              )}
              <span style={{ fontWeight: 600, color: M.ink }}>{professor.name}</span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: professor.bio.length > 0 ? M.text : M.mute,
                }}
              >
                {professor.bio.length > 0 ? professor.bio.join(" · ") : "이력 미입력"}
              </span>
              <span style={{ textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
                {professor.courseCount}개
              </span>
              <span style={{ color: M.mute }}>{formatDate(professor.createdAt)}</span>
              <span style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                <button
                  type="button"
                  style={{ ...actionButtonStyle, color: M.accent }}
                  onClick={() => handleEditClick(professor)}
                >
                  수정
                </button>
                <button
                  type="button"
                  style={{ ...actionButtonStyle, color: M.danger }}
                  onClick={() => handleDeleteClick(professor)}
                  disabled={isDeleting}
                >
                  삭제
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <ProfessorFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        professor={editTarget}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
