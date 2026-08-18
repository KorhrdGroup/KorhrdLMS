"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

import { M } from "@/features/courses/lib/course-design";

const SITE = "https://www.korhrd.co.kr";

/** 대분류 후보 — 회원관리 유입경로의 앞부분이 됩니다 */
const MAJORS = ["네이버카페", "당근", "인스타", "페이스북", "블로그", "유튜브", "지인소개"];

export type ReferralLinkCourseOption = {
  code: string;
  name: string;
};

const labelStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: M.ink, display: "block", marginBottom: 6 };
const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${M.border}`,
  fontSize: 14,
  background: "#fff",
};

/**
 * 유입 링크 생성기 — 카페 글에 올릴 추적 링크를 만들어 복사합니다.
 * 만들어진 링크로 들어와 30일 안에 회원가입하면, 회원관리 유입경로에
 * "네이버카페 › 여주맘" 처럼 찍힙니다.
 */
export function ReferralLinkGenerator({ courses }: { courses: ReferralLinkCourseOption[] }) {
  const [major, setMajor] = useState("네이버카페");
  const [minor, setMinor] = useState("");
  const [target, setTarget] = useState("/");
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    const cleanMinor = minor.trim().replaceAll("_", " ");
    // 유입경로는 "대분류_소분류" 한 값입니다. 소분류가 비어 있으면 대분류만 기록됩니다.
    const from = cleanMinor ? `${major}_${cleanMinor}` : major;
    return `${SITE}${target}?from=${from}`;
  }, [major, minor, target]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // 클립보드 권한이 없으면 수동 복사하도록 그대로 둡니다
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "180px 1fr", marginBottom: 16 }}>
        <div>
          <span style={labelStyle}>어디에 올리나요?</span>
          <select value={major} onChange={(e) => setMajor(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {MAJORS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={labelStyle}>이름 (카페명·채널명 — 회원관리에 이 글자 그대로 나옵니다)</span>
          <input
            value={minor}
            onChange={(e) => setMinor(e.target.value)}
            placeholder="예: 여주맘"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span style={labelStyle}>어느 페이지로 보낼까요?</span>
        <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="/">홈 (첫 화면)</option>
          <option value="/courses">수강신청 목록</option>
          {courses.map((course) => (
            <option key={course.code} value={`/courses/${course.code}`}>
              과정 상세 — {course.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ borderTop: `1px solid ${M.line}`, paddingTop: 20 }}>
        <span style={labelStyle}>완성된 링크 — 복사해서 글에 붙여넣으세요</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input readOnly value={link} onFocus={(e) => e.target.select()} style={{ ...inputStyle, color: M.body, background: M.hover }} />
          <button
            type="button"
            onClick={copy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "0 18px",
              borderRadius: 8,
              border: "none",
              background: copied ? "#12b76a" : "#3182F6",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {copied ? <Check style={{ width: 15, height: 15 }} /> : <Copy style={{ width: 15, height: 15 }} />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: M.mute, marginTop: 10, lineHeight: 1.7 }}>
          이 링크로 들어온 방문자가 30일 안에 회원가입하면, 회원관리 유입경로에{" "}
          <b style={{ color: M.body }}>{minor.trim() ? `${major} › ${minor.trim()}` : major}</b> 로 표시됩니다.
          같은 카페는 항상 같은 이름을 쓰세요 — 표기가 다르면 따로 집계됩니다.
        </p>
      </div>
    </div>
  );
}
