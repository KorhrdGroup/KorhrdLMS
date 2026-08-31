import type { Metadata } from "next";
import Link from "next/link";

import { AlimtalkTestView } from "@/features/others/alimtalk-test/components/alimtalk-test-view";
import { WeeklyAlimtalkSettingsCard } from "@/features/others/alimtalk-test/components/weekly-alimtalk-settings-card";
import { getWeeklyAlimtalkSettings } from "@/features/others/alimtalk-test/services/weekly-alimtalk-settings.service";
import { M } from "@/features/courses/lib/course-design";
import {
  ALIMTALK_TEMPLATE_LABELS,
  ALIMTALK_TEMPLATES,
  type AlimtalkTemplateKey,
} from "@/lib/aligo/templates";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "알림톡 테스트 | 운영관리",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

/** 발송 출처 코드 → 화면 이름 (필터·표에서 함께 씁니다) */
const TRIGGER_LABELS: Record<string, string> = {
  auto_signup: "가입 자동",
  auto_enrollment: "수강신청 자동",
  auto_over60: "60% 도달 자동",
  auto_exam_pass: "합격 자동",
  auto_exam_pass_admin: "합격 자동(어드민)",
  cron_under60: "주간 독려",
  admin_bulk: "일괄 발송",
  admin_test: "테스트",
};

export default async function AlimtalkTestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");

  const page = Math.max(1, Number(pick("page")) || 1);
  const template = pick("template");
  const trigger = pick("trigger");
  const result = pick("result") === "success" || pick("result") === "fail" ? pick("result") : "";
  const q = pick("q").trim();

  const supabase = await createClient();
  let builder = supabase
    .from("alimtalk_logs")
    .select("id, receiver_phone, receiver_name, template_key, trigger_source, success, fail_reason, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (template) builder = builder.eq("template_key", template);
  if (trigger) builder = builder.eq("trigger_source", trigger);
  if (result) builder = builder.eq("success", result === "success");
  if (q) {
    const keyword = `%${q}%`;
    builder = builder.or(`receiver_name.ilike.${keyword},receiver_phone.ilike.${keyword}`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data: logRows, count } = await builder.range(from, from + PAGE_SIZE - 1);
  const logs = logRows ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const weeklySettings = await getWeeklyAlimtalkSettings();

  const templates = (Object.keys(ALIMTALK_TEMPLATES) as AlimtalkTemplateKey[]).map((key) => {
    const templateDef = ALIMTALK_TEMPLATES[key];
    return {
      key,
      label: ALIMTALK_TEMPLATE_LABELS[key],
      ready: Boolean(templateDef.tplCode && templateDef.message),
      preview: templateDef.message,
      // 원문의 #{변수} 를 뽑아 입력칸을 만듭니다
      varNames: Array.from(new Set([...templateDef.message.matchAll(/#\{([^}]+)\}/g)].map((m) => m[1]))),
    };
  });

  /** 현재 필터를 유지한 채 일부 파라미터만 바꾼 주소 */
  const buildHref = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams();
    if (template) next.set("template", template);
    if (trigger) next.set("trigger", trigger);
    if (result) next.set("result", result);
    if (q) next.set("q", q);
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === 1) next.delete(key);
      else next.set(key, String(value));
    }
    const qs = next.toString();
    return `/admin/others/alimtalk-test${qs ? `?${qs}` : ""}#history`;
  };

  const resultChips = [
    { value: "", label: "전체" },
    { value: "success", label: "성공" },
    { value: "fail", label: "실패" },
  ];

  const controlStyle: React.CSSProperties = {
    height: 36,
    borderRadius: 8,
    border: `1px solid #E5E8EB`,
    background: "#fff",
    padding: "0 10px",
    fontSize: 13,
    color: "#191F28",
  };

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>알림톡 테스트</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: M.ink }}>알림톡 테스트</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          승인된 템플릿을 골라 내 번호로 실제 발송해 봅니다. 검수 대기 템플릿은 코드 등록 후 활성화됩니다.
        </div>
      </div>

      <WeeklyAlimtalkSettingsCard initial={weeklySettings} />

      <AlimtalkTestView templates={templates} />

      {/* ---------------- 발송 이력 ---------------- */}
      <div id="history" style={{ marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: M.ink }}>발송 이력</div>
          <div style={{ fontSize: 12.5, color: M.mute }}>총 {total.toLocaleString()}건</div>
        </div>
        <div style={{ fontSize: 12.5, color: M.mute, marginBottom: 12 }}>
          자동(가입·수강신청·60% 도달·합격), 주간 독려, 일괄·테스트 발송이 모두 남습니다.
        </div>

        {/* 필터 + 검색 — GET 폼이라 새로고침·공유해도 조건이 유지됩니다 */}
        <form
          method="get"
          action="/admin/others/alimtalk-test#history"
          style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}
        >
          <select name="template" defaultValue={template} style={controlStyle}>
            <option value="">템플릿 전체</option>
            {(Object.keys(ALIMTALK_TEMPLATE_LABELS) as AlimtalkTemplateKey[]).map((key) => (
              <option key={key} value={key}>{ALIMTALK_TEMPLATE_LABELS[key]}</option>
            ))}
          </select>

          <select name="trigger" defaultValue={trigger} style={controlStyle}>
            <option value="">출처 전체</option>
            {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {result ? <input type="hidden" name="result" value={result} /> : null}

          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="이름·전화번호 검색"
            style={{ ...controlStyle, width: 200 }}
          />
          <button
            type="submit"
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid #3182F6",
              background: "#fff",
              color: "#3182F6",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            검색
          </button>

          {/* 결과 필터 칩 — 성공/실패는 한 번에 보이는 토글이 편합니다 */}
          <div style={{ display: "flex", gap: 6, marginLeft: 4 }}>
            {resultChips.map((chip) => {
              const active = result === chip.value;
              return (
                <Link
                  key={chip.label}
                  href={buildHref({ result: chip.value, page: 1 })}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    border: `1px solid ${active ? "#3182F6" : "#E5E8EB"}`,
                    background: active ? "#EBF3FE" : "#fff",
                    color: active ? "#3182F6" : "#4E5968",
                  }}
                >
                  {chip.label}
                </Link>
              );
            })}
          </div>

          {template || trigger || result || q ? (
            <Link href="/admin/others/alimtalk-test#history" style={{ fontSize: 12.5, color: "#6B7684" }}>
              조건 초기화
            </Link>
          ) : null}
        </form>

        {logs.length === 0 ? (
          <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: M.mute, border: `1px dashed ${M.border}`, borderRadius: 10 }}>
            {total === 0 && !template && !trigger && !result && !q
              ? "발송 이력이 없습니다."
              : "조건에 맞는 발송 이력이 없습니다."}
          </div>
        ) : (
          <div style={{ overflowX: "auto", border: `1px solid #E5E8EB`, borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: `1px solid #E5E8EB` }}>
                  {["발송일시", "받는 사람", "번호", "템플릿", "출처", "결과"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#6B7684", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid #F2F4F6` }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, whiteSpace: "nowrap", color: "#4E5968" }}>
                      {new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#191F28", fontWeight: 600 }}>{row.receiver_name ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6B7684", whiteSpace: "nowrap" }}>{row.receiver_phone}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#4E5968", whiteSpace: "nowrap" }}>
                      {ALIMTALK_TEMPLATE_LABELS[row.template_key as AlimtalkTemplateKey] ?? row.template_key}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6B7684", whiteSpace: "nowrap" }}>
                      {TRIGGER_LABELS[row.trigger_source] ?? row.trigger_source}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, whiteSpace: "nowrap" }}>
                      {row.success ? (
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, background: "#E7F9EF", color: "#22C55E", fontSize: 12, fontWeight: 600 }}>
                          성공
                        </span>
                      ) : (
                        <span
                          title={row.fail_reason ?? undefined}
                          style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, background: "#FEECEE", color: "#F04452", fontSize: 12, fontWeight: 600 }}
                        >
                          실패{row.fail_reason ? ` — ${row.fail_reason}` : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16 }}>
            {page > 1 ? (
              <Link href={buildHref({ page: page - 1 })} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #E5E8EB", fontSize: 13, color: "#4E5968", textDecoration: "none" }}>
                이전
              </Link>
            ) : null}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
              .map((n, index, arr) => {
                const gapped = index > 0 && n - arr[index - 1] > 1;
                const active = n === page;
                return (
                  <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {gapped ? <span style={{ color: "#B0B8C1", fontSize: 13 }}>…</span> : null}
                    <Link
                      href={buildHref({ page: n })}
                      style={{
                        minWidth: 32,
                        textAlign: "center",
                        padding: "7px 8px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        textDecoration: "none",
                        border: `1px solid ${active ? "#3182F6" : "#E5E8EB"}`,
                        background: active ? "#EBF3FE" : "#fff",
                        color: active ? "#3182F6" : "#4E5968",
                      }}
                    >
                      {n}
                    </Link>
                  </span>
                );
              })}
            {page < totalPages ? (
              <Link href={buildHref({ page: page + 1 })} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #E5E8EB", fontSize: 13, color: "#4E5968", textDecoration: "none" }}>
                다음
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
