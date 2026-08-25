"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

import { sendAlimtalkTestAction } from "@/features/others/alimtalk-test/actions/alimtalk-test.actions";
import { M } from "@/features/courses/lib/course-design";
import type { AlimtalkTemplateKey } from "@/lib/aligo/alimtalk";

type TemplateOption = {
  key: AlimtalkTemplateKey;
  label: string;
  /** 검수 승인돼 발송 가능한 상태인지 (tplCode 존재) */
  ready: boolean;
  /** 승인 원문 미리보기 (변수 표기 그대로) */
  preview: string;
  /** 원문에 들어 있는 변수 이름들 (#{고객명} → 고객명) */
  varNames: string[];
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${M.border}`,
  fontSize: 14,
  background: "#fff",
};
const labelStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: M.ink, display: "block", marginBottom: 6 };

/**
 * 알림톡 테스트 발송 — 승인된 템플릿을 골라 내 번호로 실제 발송해 봅니다.
 * 검수 대기(코드 미기입) 템플릿은 비활성으로 보여 어떤 게 남았는지 한눈에 보입니다.
 */
export function AlimtalkTestView({ templates }: { templates: TemplateOption[] }) {
  const readyFirst = [...templates].sort((a, b) => Number(b.ready) - Number(a.ready));
  const [selectedKey, setSelectedKey] = useState<AlimtalkTemplateKey>(
    (readyFirst.find((t) => t.ready) ?? readyFirst[0]).key,
  );
  const [receiver, setReceiver] = useState("");
  const [vars, setVars] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const selected = templates.find((t) => t.key === selectedKey)!;

  async function handleSend() {
    if (sending) return;
    setSending(true);
    setResult(null);
    try {
      const response = await sendAlimtalkTestAction({
        template: selectedKey,
        receiver,
        vars,
      });
      setResult({ ok: response.success, message: response.message });
    } catch (error) {
      setResult({
        ok: false,
        message: error instanceof Error ? error.message : "발송에 실패했습니다.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "380px 1fr", alignItems: "start", maxWidth: 1000 }}>
      {/* 왼쪽 — 발송 폼 */}
      <div>
        <span style={labelStyle}>템플릿</span>
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {readyFirst.map((template) => {
            const active = template.key === selectedKey;
            return (
              <button
                key={template.key}
                type="button"
                onClick={() => {
                  setSelectedKey(template.key);
                  setResult(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 14px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  border: `1px solid ${active ? "#3182F6" : M.border}`,
                  background: active ? "#EAF2FE" : "#fff",
                  color: active ? "#3182F6" : M.body,
                }}
              >
                {template.label}
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: template.ready ? "#E6F6EE" : "#F2F4F7",
                    color: template.ready ? "#0a7350" : M.mute,
                  }}
                >
                  {template.ready ? "발송 가능" : "검수 대기"}
                </span>
              </button>
            );
          })}
        </div>

        <span style={labelStyle}>수신번호 (테스트 받을 휴대폰)</span>
        <input
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="010-0000-0000"
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        {selected.varNames.map((name) => (
          <div key={name} style={{ marginBottom: 12 }}>
            <span style={labelStyle}>변수 — {name}</span>
            <input
              value={vars[name] ?? ""}
              onChange={(e) => setVars((prev) => ({ ...prev, [name]: e.target.value }))}
              placeholder={`#{${name}} 자리에 들어갈 값`}
              style={inputStyle}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !selected.ready}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            fontSize: 14.5,
            fontWeight: 700,
            cursor: sending || !selected.ready ? "default" : "pointer",
            background: !selected.ready ? "#E4E7EC" : sending ? "#9dc4fb" : "#3182F6",
            color: !selected.ready ? M.mute : "#fff",
          }}
        >
          {!selected.ready ? "검수 승인 후 발송 가능" : sending ? "발송 중…" : "테스트 발송"}
        </button>

        {result ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 13,
              background: result.ok ? "#E6F6EE" : "#fdecee",
              color: result.ok ? "#0a7350" : M.danger,
            }}
          >
            {result.message}
          </div>
        ) : null}
      </div>

      {/* 오른쪽 — 승인 원문 미리보기 */}
      <div>
        <span style={labelStyle}>승인 원문 미리보기</span>
        <pre
          style={{
            margin: 0,
            padding: "16px 18px",
            borderRadius: 12,
            border: `1px solid ${M.border}`,
            background: "#FEF9E7",
            fontSize: 13,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "inherit",
            minHeight: 200,
            color: M.body,
          }}
        >
          {selected.preview || "검수 승인 후 알리고 관리자에서 원문을 가져와 채웁니다."}
        </pre>
        <p style={{ fontSize: 12.5, color: M.mute, marginTop: 10, lineHeight: 1.7 }}>
          발송 원문은 카카오에 승인된 템플릿과 <b>한 글자까지 일치</b>해야 합니다. 여기 미리보기는
          코드에 등록된 원문 그대로이며, 알리고 관리자에서 템플릿을 수정·재검수했다면 코드도 같이
          갱신해야 합니다.
        </p>
      </div>
    </div>
  );
}
