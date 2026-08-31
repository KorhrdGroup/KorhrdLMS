"use client";

import { useState, useTransition } from "react";

import { M } from "@/features/courses/lib/course-design";
import { updateWeeklyAlimtalkSettingsAction } from "@/features/others/alimtalk-test/actions/alimtalk-test.actions";
import type { WeeklyAlimtalkSettings } from "@/features/others/alimtalk-test/services/weekly-alimtalk-settings.service";

const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

/**
 * 주간 수강 독려 알림톡 발송 설정 카드 — 요일·시간(KST)·on/off.
 * 크론은 매시간 돌고, 여기 저장된 시각에만 실제 발송됩니다.
 */
export function WeeklyAlimtalkSettingsCard({ initial }: { initial: WeeklyAlimtalkSettings }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [weekday, setWeekday] = useState(initial.weekday);
  const [hour, setHour] = useState(initial.hour);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  const save = () => {
    setMessage(null);
    startSave(async () => {
      const result = await updateWeeklyAlimtalkSettingsAction({ enabled, weekday, hour });
      setMessage(result.message);
    });
  };

  const selectStyle: React.CSSProperties = {
    height: 36,
    borderRadius: 8,
    border: `1px solid ${M.border}`,
    background: "#fff",
    padding: "0 10px",
    fontSize: 13,
    color: M.ink,
  };

  return (
    <div
      style={{
        border: `1px solid ${M.border}`,
        borderRadius: 12,
        padding: 20,
        marginBottom: 28,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, color: M.ink, marginBottom: 4 }}>
        주간 수강 독려 발송 설정
      </div>
      <div style={{ fontSize: 12.5, color: M.mute, marginBottom: 14 }}>
        수강률 60% 미만 회원에게 보내는 독려 알림톡의 발송 요일·시간을 정합니다 (한국 시간 기준).
        {initial.lastSentDate ? ` 최근 발송일 ${initial.lastSentDate}.` : " 아직 발송 이력이 없습니다."}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: M.body, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            style={{ width: 16, height: 16, accentColor: "#3182F6" }}
          />
          자동 발송 사용
        </label>

        <select value={weekday} onChange={(event) => setWeekday(Number(event.target.value))} style={selectStyle} disabled={!enabled}>
          {WEEKDAYS.map((name, index) => (
            <option key={name} value={index}>매주 {name}</option>
          ))}
        </select>

        <select value={hour} onChange={(event) => setHour(Number(event.target.value))} style={selectStyle} disabled={!enabled}>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>{h}시</option>
          ))}
        </select>

        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          style={{
            height: 36,
            padding: "0 18px",
            borderRadius: 8,
            border: "none",
            background: "#3182F6",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>

        {message ? <span style={{ fontSize: 12.5, color: M.mute }}>{message}</span> : null}
      </div>
    </div>
  );
}
