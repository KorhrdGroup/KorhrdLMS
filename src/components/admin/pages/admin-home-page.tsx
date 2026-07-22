import Link from "next/link";
import type { CSSProperties } from "react";

import type {
  AdminDashboardData,
  DashboardCalendar,
  DashboardItem,
  DashboardStatRow,
} from "@/features/admin-dashboard/services/admin-dashboard.service";
import { todayFullLabel } from "@/features/admin-dashboard/services/admin-dashboard.service";

/**
 * 관리자 홈(대시보드). 화이트톤 디자인을 적용하고 데이터는 서버에서 조회한
 * 실데이터(getAdminDashboard)로 채웁니다. 사이드바/헤더는 AdminShell이 제공하므로
 * 여기서는 본문만 렌더합니다.
 */

// Toss TDS 팔레트 기반 (오렌지 → 토스블루 전면 교체)
const C = {
  ink: "#191f28",
  text: "#4e5968",
  body: "#4e5968",
  mute: "#8b95a1",
  line: "#e5e8eb",
  hover: "#f2f4f6",
  accent: "#3182f6",
  accentDim: "#2272eb",
  calSun: "#e42939",
};

function Row({ item, last }: { item: { title: React.ReactNode; date: string }; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 2px",
        borderBottom: last ? "none" : `1px solid ${C.line}`,
        fontSize: 13.5,
        color: C.text,
      }}
    >
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.title}
      </span>
      <span style={{ color: C.mute, fontSize: 12, flex: "none" }}>{item.date}</span>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div style={{ padding: "18px 2px", fontSize: 13, color: C.mute, textAlign: "center" }}>{label}</div>
  );
}

function Panel({
  title,
  badge,
  href,
  children,
}: {
  title: string;
  badge?: number;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          paddingBottom: 10,
          borderBottom: `1.5px solid ${C.ink}`,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>
          {title}
          {badge != null && badge > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                background: C.accent,
                borderRadius: 9,
                padding: "2px 7px",
                marginLeft: 8,
                verticalAlign: 2,
              }}
            >
              {badge}
            </span>
          )}
        </span>
        {href ? (
          <Link href={href} style={{ fontSize: 12, color: C.mute, textDecoration: "none" }}>
            더보기 →
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  accent,
  last,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <div style={{ padding: "18px 20px 16px", borderRight: last ? "none" : `1px solid ${C.line}` }}>
      <div style={{ fontSize: 12, color: C.mute, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "-.02em",
            color: accent ? C.accent : C.ink,
          }}
        >
          {value}
        </span>
        {sub ? <span style={{ fontSize: 12, color: C.body }}>{sub}</span> : null}
      </div>
    </div>
  );
}

function Calendar({ calendar }: { calendar: DashboardCalendar }) {
  const cells: (number | null)[] = [
    ...Array.from({ length: calendar.firstWeekday }, () => null),
    ...Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div style={{ background: C.ink, borderRadius: 12, padding: "20px 22px", color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{calendar.label}</span>
        <span style={{ fontSize: 11, color: C.mute }}>{calendar.todayLabel}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, textAlign: "center", fontSize: 11.5 }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <span key={d} style={{ color: i === 0 ? C.calSun : C.mute, padding: "3px 0" }}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d == null) {
            return <span key={`e-${i}`} />;
          }
          const isToday = d === calendar.todayDay;
          const style: CSSProperties = {
            padding: "5px 0",
            color: i % 7 === 0 ? C.calSun : undefined,
            ...(isToday ? { background: C.accent, borderRadius: 8, fontWeight: 700, color: "#fff" } : null),
          };
          return (
            <span key={`d-${d}`} style={style}>
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StatList({ title, rows }: { title: string; rows: DashboardStatRow[] }) {
  return (
    <div>
      <div style={{ paddingBottom: 10, borderBottom: `1.5px solid ${C.ink}`, fontSize: 15, fontWeight: 700, color: C.ink }}>
        {title}
      </div>
      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "11px 2px",
            borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.line}`,
            fontSize: 13,
            color: C.text,
          }}
        >
          <span>{r.label}</span>
          <b style={{ color: r.hot ? C.accent : undefined }}>{r.value}</b>
        </div>
      ))}
    </div>
  );
}

function renderItems(items: DashboardItem[], emptyLabel: string) {
  if (items.length === 0) {
    return <EmptyRow label={emptyLabel} />;
  }
  return items.map((it, i) => <Row key={`${it.title}-${i}`} item={it} last={i === items.length - 1} />);
}

export function AdminHomePage({ dashboard }: { dashboard: AdminDashboardData }) {
  const {
    kpis,
    notices,
    consultations,
    consultationUnanswered,
    questions,
    examsTasks,
    newStatus,
    tuition,
    calendar,
  } = dashboard;

  return (
    // AdminContent의 회색 배경(p-6)을 상쇄하고 대시보드 영역을 흰색으로 채웁니다.
    <div
      style={{
        fontFamily: "inherit",
        color: C.text,
        background: "#ffffff",
        margin: -24,
        padding: 24,
        minHeight: "calc(100% + 48px)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.ink }}>대시보드</div>
        <div style={{ fontSize: 13, color: C.mute, marginTop: 4 }}>
          {todayFullLabel()} · 오늘도 좋은 하루 되세요
        </div>
      </div>

      {/* KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          borderTop: `1.5px solid ${C.ink}`,
          borderBottom: `1px solid ${C.line}`,
          marginBottom: 26,
        }}
      >
        {kpis.map((k, i) => (
          <Kpi key={k.label} label={k.label} value={k.value} sub={k.sub} accent={k.accent} last={i === kpis.length - 1} />
        ))}
      </div>

      {/* 본문 3열 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="프론트 공지사항" href="/admin/notices">
            {renderItems(notices, "등록된 공지가 없습니다.")}
          </Panel>
          <Panel title="1:1 상담" badge={consultationUnanswered} href="/admin/boards/consultation">
            {consultations.length === 0 ? (
              <EmptyRow label="등록된 상담이 없습니다." />
            ) : (
              consultations.map((it, i) => (
                <Row
                  key={`${it.title}-${i}`}
                  last={i === consultations.length - 1}
                  item={{
                    date: it.date,
                    title: (
                      <>
                        {it.title}{" "}
                        {!it.answered ? (
                          <em style={{ fontStyle: "normal", fontSize: 11, color: C.accent, fontWeight: 600 }}>미답변</em>
                        ) : null}
                      </>
                    ),
                  }}
                />
              ))
            )}
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Panel title="자유게시판" href="/admin/boards/free">
            {renderItems(questions, "등록된 글이 없습니다.")}
          </Panel>
          <Panel title="시험 / 과제 현황" href="/admin/exams">
            {examsTasks.length === 0 ? (
              <EmptyRow label="진행중인 시험·과제가 없습니다." />
            ) : (
              examsTasks.map((it, i) => (
                <Row
                  key={`${it.title}-${i}`}
                  last={i === examsTasks.length - 1}
                  item={{
                    date: it.date,
                    title: (
                      <>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 4,
                            padding: "1px 6px",
                            marginRight: 8,
                            color: it.kind === "시험" ? C.accent : C.body,
                            border: `1px solid ${it.kind === "시험" ? "#c3dafe" : "#e5e8eb"}`,
                          }}
                        >
                          {it.kind}
                        </span>
                        {it.title}
                      </>
                    ),
                  }}
                />
              ))
            )}
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Calendar calendar={calendar} />
          <StatList title="신규 현황" rows={newStatus} />
          <StatList title="수강료" rows={tuition} />
        </div>
      </div>
    </div>
  );
}
