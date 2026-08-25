import type { Metadata } from "next";

import { AlimtalkTestView } from "@/features/others/alimtalk-test/components/alimtalk-test-view";
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

export default async function AlimtalkTestPage() {
  // 최근 발송 이력 200건 — 자동·크론·일괄·테스트 모든 경로가 기록됩니다
  const supabase = await createClient();
  const { data: logRows } = await supabase
    .from("alimtalk_logs")
    .select("id, receiver_phone, receiver_name, template_key, trigger_source, success, fail_reason, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const logs = logRows ?? [];

  const templates = (Object.keys(ALIMTALK_TEMPLATES) as AlimtalkTemplateKey[]).map((key) => {
    const template = ALIMTALK_TEMPLATES[key];
    return {
      key,
      label: ALIMTALK_TEMPLATE_LABELS[key],
      ready: Boolean(template.tplCode && template.message),
      preview: template.message,
      // 원문의 #{변수} 를 뽑아 입력칸을 만듭니다
      varNames: Array.from(new Set([...template.message.matchAll(/#\{([^}]+)\}/g)].map((m) => m[1]))),
    };
  });

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>알림톡 테스트</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>알림톡 테스트</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          승인된 템플릿을 골라 내 번호로 실제 발송해 봅니다. 검수 대기 템플릿은 코드 등록 후 활성화됩니다.
        </div>
      </div>

      <AlimtalkTestView templates={templates} />

      {/* ---------------- 발송 이력 ---------------- */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: M.ink, marginBottom: 4 }}>발송 이력</div>
        <div style={{ fontSize: 12.5, color: M.mute, marginBottom: 12 }}>
          최근 200건 — 자동(가입·수강신청·60% 도달), 주간 독려, 일괄·테스트 발송이 모두 남습니다.
        </div>
        {logs.length === 0 ? (
          <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: M.mute, border: `1px dashed ${M.border}`, borderRadius: 10 }}>
            발송 이력이 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${M.border}` }}>
                  {["발송일시", "받는 사람", "번호", "템플릿", "출처", "결과"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 10px", fontSize: 12, fontWeight: 500, color: M.mute, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} style={{ borderBottom: `1px solid #F2F4F7` }}>
                    <td style={{ padding: "10px 10px", fontSize: 13, whiteSpace: "nowrap", color: M.body }}>
                      {new Date(row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 13, color: M.ink, fontWeight: 600 }}>{row.receiver_name ?? "—"}</td>
                    <td style={{ padding: "10px 10px", fontSize: 13, color: M.mute, whiteSpace: "nowrap" }}>{row.receiver_phone}</td>
                    <td style={{ padding: "10px 10px", fontSize: 13, color: M.body }}>
                      {ALIMTALK_TEMPLATE_LABELS[row.template_key as AlimtalkTemplateKey] ?? row.template_key}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 13, color: M.mute }}>
                      {{
                        auto_signup: "가입 자동",
                        auto_enrollment: "수강신청 자동",
                        auto_over60: "60% 도달 자동",
                        cron_under60: "주간 독려",
                        admin_bulk: "일괄 발송",
                        admin_test: "테스트",
                      }[row.trigger_source] ?? row.trigger_source}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 13, whiteSpace: "nowrap" }}>
                      {row.success ? (
                        <span style={{ color: "#12b76a", fontWeight: 700 }}>성공</span>
                      ) : (
                        <span style={{ color: M.danger, fontWeight: 700 }} title={row.fail_reason ?? undefined}>
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
      </div>
    </div>
  );
}
