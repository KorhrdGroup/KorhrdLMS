"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  bulkSendMemberAlimtalkAction,
  countMemberAlimtalkTargetsAction,
} from "@/features/members/actions/member-alimtalk.actions";
import type { AlimtalkTargetMode } from "@/features/members/services/member-alimtalk.service";
import { M } from "@/features/members/lib/member-design";
import {
  ALIMTALK_TEMPLATE_LABELS,
  ALIMTALK_TEMPLATES,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/alimtalk";

type MemberAlimtalkModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 목록에서 체크한 회원 id 들 */
  selectedIds: string[];
  /** 현재 목록의 가입 출처 필터 — 수강률 대상 계산에도 같은 범위를 씁니다 */
  source: "" | "office" | "general";
};

const TARGET_OPTIONS: Array<{ mode: AlimtalkTargetMode; label: string; hint: string }> = [
  { mode: "selected", label: "선택한 회원", hint: "목록에서 체크한 회원에게 보냅니다" },
  { mode: "progress_over", label: "수강률 60% 이상", hint: "시험 응시가 가능한(수료 전) 회원 전체" },
  { mode: "progress_under", label: "수강률 60% 미만", hint: "수강 중이지만 아직 60%가 안 된 회원 전체" },
];

/** 대상에 어울리는 템플릿을 기본 선택해 실수를 줄입니다 */
const DEFAULT_TEMPLATE: Record<AlimtalkTargetMode, AlimtalkTemplateKey> = {
  selected: "SIGNUP",
  progress_over: "PROGRESS_OVER_60",
  progress_under: "PROGRESS_UNDER_60",
};

const labelStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: M.ink, display: "block", marginBottom: 6 };

export function MemberAlimtalkModal({ open, onOpenChange, selectedIds, source }: MemberAlimtalkModalProps) {
  const [mode, setMode] = useState<AlimtalkTargetMode>("selected");
  const [template, setTemplate] = useState<AlimtalkTemplateKey>("SIGNUP");
  const [targetCount, setTargetCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode(selectedIds.length > 0 ? "selected" : "progress_under");
    setResult(null);
  }, [open, selectedIds.length]);

  useEffect(() => {
    setTemplate(DEFAULT_TEMPLATE[mode]);
  }, [mode]);

  // 대상 수 미리보기
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setTargetCount(null);
    countMemberAlimtalkTargetsAction({ mode, memberIds: selectedIds, source })
      .then((response) => alive && setTargetCount(response.success ? response.count : 0))
      .catch(() => alive && setTargetCount(0));
    return () => {
      alive = false;
    };
  }, [open, mode, selectedIds, source]);

  if (!open) return null;

  const templateKeys = Object.keys(ALIMTALK_TEMPLATES) as AlimtalkTemplateKey[];
  const preview = ALIMTALK_TEMPLATES[template].message;

  async function handleSend() {
    if (sending || !targetCount) return;
    if (
      !window.confirm(
        `${targetCount}명에게 "${ALIMTALK_TEMPLATE_LABELS[template]}" 알림톡을 보낼까요?`,
      )
    ) {
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const response = await bulkSendMemberAlimtalkAction({
        template,
        mode,
        memberIds: selectedIds,
        source,
      });
      setResult({ ok: response.success, message: response.message });
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "발송에 실패했습니다." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="알림톡 발송"
      style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div onClick={() => onOpenChange(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.45)" }} />
      <div
        style={{
          position: "relative", width: "min(880px, 94vw)", maxHeight: "88vh",
          display: "flex", flexDirection: "column", background: "#fff",
          borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,.24)", overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${M.line}` }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: M.ink }}>알림톡 발송</div>
          <button
            type="button" onClick={() => onOpenChange(false)} aria-label="닫기"
            style={{ marginLeft: "auto", display: "inline-flex", padding: 7, borderRadius: 8, border: "none", background: M.hover, cursor: "pointer", color: M.body }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: 20, display: "grid", gap: 20, gridTemplateColumns: "340px 1fr" }}>
          <div>
            <span style={labelStyle}>보낼 대상</span>
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              {TARGET_OPTIONS.map((option) => {
                const active = option.mode === mode;
                const disabled = option.mode === "selected" && selectedIds.length === 0;
                return (
                  <button
                    key={option.mode} type="button" disabled={disabled}
                    onClick={() => setMode(option.mode)}
                    style={{
                      textAlign: "left", padding: "11px 14px", borderRadius: 8, cursor: disabled ? "default" : "pointer",
                      border: `1px solid ${active ? "#3182F6" : M.border}`,
                      background: disabled ? "#F9FAFB" : active ? "#EAF2FE" : "#fff",
                      color: disabled ? M.mute : active ? "#3182F6" : M.body,
                    }}
                  >
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                      {option.label}
                      {option.mode === "selected" ? ` (${selectedIds.length}명 체크됨)` : ""}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 2, color: disabled ? M.mute : active ? "#3182F6" : M.mute }}>
                      {option.hint}
                    </div>
                  </button>
                );
              })}
            </div>

            <span style={labelStyle}>템플릿</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as AlimtalkTemplateKey)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${M.border}`, fontSize: 14, background: "#fff", cursor: "pointer", marginBottom: 16 }}
            >
              {templateKeys.map((key) => (
                <option key={key} value={key} disabled={!ALIMTALK_TEMPLATES[key].tplCode}>
                  {ALIMTALK_TEMPLATE_LABELS[key]}
                  {!ALIMTALK_TEMPLATES[key].tplCode ? " (검수 대기)" : ""}
                </option>
              ))}
            </select>

            <div style={{ fontSize: 13, color: M.body, marginBottom: 12 }}>
              발송 대상: <b style={{ color: M.ink }}>{targetCount === null ? "계산 중…" : `${targetCount}명`}</b>
              <div style={{ fontSize: 12, color: M.mute, marginTop: 4 }}>
                학점연계(오피스) 가입 회원은 항상 발송 대상에서 제외됩니다.
              </div>
            </div>

            <button
              type="button" onClick={handleSend}
              disabled={sending || !targetCount}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                fontSize: 14.5, fontWeight: 700, cursor: sending || !targetCount ? "default" : "pointer",
                background: sending || !targetCount ? "#E4E7EC" : "#3182F6",
                color: sending || !targetCount ? M.mute : "#fff",
              }}
            >
              {sending ? "발송 중…" : "알림톡 발송"}
            </button>

            {result ? (
              <div style={{ marginTop: 12, borderRadius: 8, padding: "11px 14px", fontSize: 13, background: result.ok ? "#E6F6EE" : "#fdecee", color: result.ok ? "#0a7350" : M.danger }}>
                {result.message}
              </div>
            ) : null}
          </div>

          <div>
            <span style={labelStyle}>발송 문구 미리보기 — #&#123;고객명&#125; 자리에 회원 이름이 들어갑니다</span>
            <pre
              style={{
                margin: 0, padding: "16px 18px", borderRadius: 12, border: `1px solid ${M.border}`,
                background: "#FEF9E7", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap",
                wordBreak: "break-word", fontFamily: "inherit", minHeight: 240, color: M.body,
              }}
            >
              {preview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
