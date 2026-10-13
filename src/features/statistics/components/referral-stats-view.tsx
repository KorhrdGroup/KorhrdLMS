"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { Fragment, useState } from "react";

import { M } from "@/features/courses/lib/course-design";
import type { ReferralStatsQuery, ReferralStatsRow } from "@/features/statistics/services/referral-stats.service";

type ReferralStatsViewProps = {
  rows: ReferralStatsRow[];
  query: ReferralStatsQuery;
  /** 빠른 기간 버튼용 — 서버가 KST 오늘 기준으로 계산해 넘깁니다 */
  periods: { label: string; startDate: string; endDate: string }[];
};

const th: CSSProperties = {
  padding: "11px 14px",
  fontSize: 12.5,
  fontWeight: 600,
  color: M.mute,
  textAlign: "right",
  borderBottom: `1px solid ${M.border}`,
  whiteSpace: "nowrap",
};
const td: CSSProperties = {
  padding: "12px 14px",
  fontSize: 13.5,
  color: M.text,
  textAlign: "right",
  borderBottom: `1px solid ${M.border}`,
  whiteSpace: "nowrap",
};
const inputBox: CSSProperties = {
  height: 36,
  border: `1px solid ${M.border}`,
  borderRadius: 8,
  padding: "0 10px",
  fontSize: 13,
  color: M.text,
  background: "#fff",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "2-digit", month: "2-digit", day: "2-digit" });

export function ReferralStatsView({ rows, query, periods }: ReferralStatsViewProps) {
  const router = useRouter();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(query.startDate);
  const [endDate, setEndDate] = useState(query.endDate);

  function go(next: ReferralStatsQuery) {
    const params = new URLSearchParams();
    if (next.startDate) params.set("startDate", next.startDate);
    if (next.endDate) params.set("endDate", next.endDate);
    setStartDate(next.startDate);
    setEndDate(next.endDate);
    setOpenKey(null);
    router.push(`/admin/statistics/members${params.size ? `?${params}` : ""}`);
  }

  const total = rows.reduce(
    (sum, row) => ({
      signups: sum.signups + row.signups,
      enrolledMembers: sum.enrolledMembers + row.enrolledMembers,
      certificateMembers: sum.certificateMembers + row.certificateMembers,
      certificateApplications: sum.certificateApplications + row.certificateApplications,
      paidApplications: sum.paidApplications + row.paidApplications,
    }),
    { signups: 0, enrolledMembers: 0, certificateMembers: 0, certificateApplications: 0, paidApplications: 0 },
  );
  const totalRate = total.signups ? Math.round((total.certificateMembers / total.signups) * 1000) / 10 : 0;

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          통계 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>유입경로</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>유입경로 통계</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          가입 때 남은 유입경로(?from= 링크)별로 가입 → 수강신청 → 자격증신청까지 이어졌는지 봅니다. 기간은
          가입일 기준이며, 줄을 누르면 학생 목록이 열립니다.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
        {[{ label: "전체", startDate: "", endDate: "" }, ...periods].map((period) => {
          const active = period.startDate === query.startDate && period.endDate === query.endDate;
          return (
            <button
              key={period.label}
              type="button"
              onClick={() => go({ startDate: period.startDate, endDate: period.endDate })}
              style={{
                height: 36,
                padding: "0 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${active ? "#3182F6" : M.border}`,
                background: active ? "#EAF2FE" : "#fff",
                color: active ? "#3182F6" : M.body,
              }}
            >
              {period.label}
            </button>
          );
        })}
        <span style={{ width: 8 }} />
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} style={inputBox} />
        <span style={{ color: M.mute }}>~</span>
        <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} style={inputBox} />
        <button
          type="button"
          onClick={() => go({ startDate, endDate })}
          style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "none", background: M.ink, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          조회
        </button>
      </div>

      <div style={{ border: `1px solid ${M.border}`, borderRadius: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>유입경로</th>
              <th style={th}>회원가입</th>
              <th style={th}>수강신청</th>
              <th style={th}>자격증신청</th>
              <th style={th}>결제완료</th>
              <th style={th}>전환율</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...td, textAlign: "center", color: M.mute, padding: 40 }}>
                  이 기간에 가입한 회원이 없습니다.
                </td>
              </tr>
            ) : null}
            {rows.map((row) => {
              const open = openKey === row.key;
              return (
                <Fragment key={row.key}>
                  <tr
                    onClick={() => setOpenKey(open ? null : row.key)}
                    style={{ cursor: "pointer", background: open ? "#F5F9FF" : undefined }}
                  >
                    <td style={{ ...td, textAlign: "left", fontWeight: 600, color: M.ink }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        {row.label}
                      </span>
                    </td>
                    <td style={td}>{row.signups.toLocaleString()}명</td>
                    <td style={td}>{row.enrolledMembers.toLocaleString()}명</td>
                    <td style={td}>
                      {row.certificateApplications.toLocaleString()}건
                      <span style={{ color: M.mute, fontSize: 12, marginLeft: 4 }}>({row.certificateMembers}명)</span>
                    </td>
                    <td style={td}>{row.paidApplications.toLocaleString()}건</td>
                    <td style={{ ...td, fontWeight: 700, color: row.conversionRate > 0 ? "#3182F6" : M.mute }}>
                      {row.conversionRate}%
                    </td>
                  </tr>
                  {open ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, borderBottom: `1px solid ${M.border}`, background: "#FAFBFC" }}>
                        <StudentList row={row} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
          {rows.length > 0 ? (
            <tfoot>
              <tr style={{ background: "#F9FAFB" }}>
                <td style={{ ...td, textAlign: "left", fontWeight: 700 }}>합계</td>
                <td style={{ ...td, fontWeight: 700 }}>{total.signups.toLocaleString()}명</td>
                <td style={{ ...td, fontWeight: 700 }}>{total.enrolledMembers.toLocaleString()}명</td>
                <td style={{ ...td, fontWeight: 700 }}>
                  {total.certificateApplications.toLocaleString()}건
                  <span style={{ color: M.mute, fontSize: 12, marginLeft: 4 }}>({total.certificateMembers}명)</span>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{total.paidApplications.toLocaleString()}건</td>
                <td style={{ ...td, fontWeight: 700 }}>{totalRate}%</td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      <p style={{ fontSize: 12, color: M.mute, marginTop: 10, lineHeight: 1.6 }}>
        전환율 = 자격증신청한 회원 ÷ 가입 회원. 수강신청은 확정된 수강이 1건 이상인 회원 수입니다.
        옛 시스템 이관 신청·관리자 비회원 추가 건은 회원 연결이 없어 여기 잡히지 않습니다. 파트너스 코드가
        있는 회원은 유입경로 대신 파트너스로 묶입니다. &quot;경로 없음&quot;은 인원이 많아 자격증신청 학생만 펼쳐 보여줍니다.
      </p>
    </div>
  );
}

function StudentList({ row }: { row: ReferralStatsRow }) {
  const [onlyApplied, setOnlyApplied] = useState(row.studentsAppliedOnly || row.certificateMembers > 0);
  const students = onlyApplied ? row.students.filter((student) => student.certificates.length > 0) : row.students;

  return (
    <div style={{ padding: "12px 16px 16px 36px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[
          { value: true, label: `자격증신청 학생 ${row.certificateMembers}` },
          ...(row.studentsAppliedOnly ? [] : [{ value: false, label: `가입 전체 ${row.signups}` }]),
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setOnlyApplied(tab.value)}
            style={{
              height: 30,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${onlyApplied === tab.value ? "#3182F6" : M.border}`,
              background: onlyApplied === tab.value ? "#EAF2FE" : "#fff",
              color: onlyApplied === tab.value ? "#3182F6" : M.body,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {students.length === 0 ? (
        <div style={{ fontSize: 13, color: M.mute, padding: "8px 0" }}>자격증신청한 학생이 없습니다.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", border: `1px solid ${M.border}` }}>
          <thead>
            <tr>
              {["이름", "아이디", "연락처", "가입일", "수강과정", "자격증신청"].map((label) => (
                <th key={label} style={{ ...th, textAlign: "left", padding: "8px 12px" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px" }}>
                  <a
                    href={`/admin/members/${student.id}`}
                    style={{ color: M.ink, fontWeight: 600, textDecoration: "none" }}
                  >
                    {student.name}
                  </a>
                </td>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px", color: M.body }}>{student.loginId}</td>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px", color: M.body }}>{student.phone ?? "-"}</td>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px", color: M.body }}>{formatDate(student.joinedAt)}</td>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px", color: M.body, whiteSpace: "normal" }}>
                  {student.courseNames.length ? student.courseNames.join(", ") : "-"}
                </td>
                <td style={{ ...td, textAlign: "left", padding: "8px 12px", whiteSpace: "normal" }}>
                  {student.certificates.length
                    ? student.certificates.map((cert, index) => (
                        <span key={`${cert.name}-${index}`} style={{ display: "inline-block", marginRight: 10 }}>
                          {cert.name}{" "}
                          <span style={{ fontSize: 12, fontWeight: 600, color: cert.paid ? "#3182F6" : M.danger }}>
                            {cert.paid ? "결제" : "미결제"}
                          </span>
                        </span>
                      ))
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
