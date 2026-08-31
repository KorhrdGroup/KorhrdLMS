import type { Metadata } from "next";
import Link from "next/link";

import { M } from "@/features/courses/lib/course-design";
import { BABY_ADMIN_PARTNER_CODE, isBabyAdmin } from "@/lib/admin/current-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "이용권결제 | 결제관리",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  paid: { label: "결제완료", bg: "#E7F9EF", color: "#22C55E" },
  failed: { label: "실패", bg: "#FEECEE", color: "#F04452" },
  canceled: { label: "취소", bg: "#F2F4F6", color: "#8B95A1" },
};

/** 평생교육이용권 결제 이력 — 나이스페이 결제창(/voucher) 결제가 쌓입니다. */
export default async function VoucherPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(typeof params.page === "string" ? params.page : "") || 1);
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const supabase = await createClient();
  let builder = supabase
    .from("voucher_payments")
    .select(
      "id, buyer_name, buyer_tel, amount, status, moid, tid, result_msg, paid_at, created_at, member:members ( login_id, partner_code )",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  // 아기관리자는 파트너스 코드(STAR) 회원의 결제만 봅니다
  if (await isBabyAdmin()) {
    builder = builder.eq("member.partner_code" as never, BABY_ADMIN_PARTNER_CODE as never).not("member", "is", null);
  }

  if (q) {
    const keyword = `%${q}%`;
    builder = builder.or(`buyer_name.ilike.${keyword},buyer_tel.ilike.${keyword},moid.ilike.${keyword}`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await builder.range(from, from + PAGE_SIZE - 1);
  type Row = {
    id: string;
    buyer_name: string;
    buyer_tel: string | null;
    amount: number;
    status: string;
    moid: string;
    tid: string | null;
    result_msg: string | null;
    paid_at: string | null;
    created_at: string;
    member: { login_id: string; partner_code: string | null } | null;
  };
  const rows = (data ?? []) as unknown as Row[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (n: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (n > 1) next.set("page", String(n));
    const qs = next.toString();
    return `/admin/payments/vouchers${qs ? `?${qs}` : ""}`;
  };

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          결제관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>이용권결제</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: M.ink }}>평생교육이용권 결제 이력</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          고객센터의 평생교육이용권 결제(나이스페이) 내역입니다. 총 {total.toLocaleString()}건
        </div>
      </div>

      <form method="get" action="/admin/payments/vouchers" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="이름·전화번호·주문번호 검색"
          style={{ height: 36, borderRadius: 8, border: "1px solid #E5E8EB", padding: "0 10px", fontSize: 13, width: 240, color: "#191F28" }}
        />
        <button
          type="submit"
          style={{ height: 36, padding: "0 16px", borderRadius: 8, border: "1px solid #3182F6", background: "#fff", color: "#3182F6", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
        >
          검색
        </button>
      </form>

      {rows.length === 0 ? (
        <div style={{ padding: "26px 0", textAlign: "center", fontSize: 13, color: M.mute, border: `1px dashed ${M.border}`, borderRadius: 10 }}>
          {q ? "검색 결과가 없습니다." : "결제 이력이 없습니다."}
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid #E5E8EB", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E8EB" }}>
                {["결제일시", "이름", "아이디", "연락처", "금액", "상태", "주문번호", "거래번호(TID)"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 500, color: "#6B7684", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = STATUS_LABELS[row.status] ?? { label: row.status, bg: "#F2F4F6", color: "#4E5968" };
                return (
                  <tr key={row.id} style={{ borderBottom: "1px solid #F2F4F6" }}>
                    <td style={{ padding: "10px 12px", fontSize: 13, whiteSpace: "nowrap", color: "#4E5968" }}>
                      {new Date(row.paid_at ?? row.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#191F28", fontWeight: 600, whiteSpace: "nowrap" }}>{row.buyer_name}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6B7684", whiteSpace: "nowrap" }}>{row.member?.login_id ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#6B7684", whiteSpace: "nowrap" }}>{row.buyer_tel ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#191F28", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {row.amount.toLocaleString()}원
                    </td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <span
                        title={row.result_msg ?? undefined}
                        style={{ display: "inline-block", padding: "3px 8px", borderRadius: 6, background: status.bg, color: status.color, fontSize: 12, fontWeight: 600 }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12.5, color: "#8B95A1", whiteSpace: "nowrap" }}>{row.moid}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12.5, color: "#8B95A1", whiteSpace: "nowrap" }}>{row.tid ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
            .map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                style={{
                  minWidth: 32, textAlign: "center", padding: "7px 8px", borderRadius: 8, fontSize: 13,
                  fontWeight: n === page ? 700 : 500, textDecoration: "none",
                  border: `1px solid ${n === page ? "#3182F6" : "#E5E8EB"}`,
                  background: n === page ? "#EBF3FE" : "#fff",
                  color: n === page ? "#3182F6" : "#4E5968",
                }}
              >
                {n}
              </Link>
            ))}
        </div>
      ) : null}
    </div>
  );
}
