import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * 한평생 오피스 → 한직훈 자격증 신청 · 회원 (업셀링 고객 프로필 재료, 2026-11-19).
 *
 * 오피스가 매일 새벽(03:00) 서버끼리 부릅니다(/api/cron/hanjikhun-customers) — 받은 것은 오피스 hanjikhun_customers 에 쌓이고,
 * 03:30 업셀링 고객 프로필(학습 단계 「학점연계 · 한직훈 선후납 · 한직훈 회원가입만」)이 됩니다.
 * 유입경로 통계와 같은 비밀키(x-partner-key = PARTNER_AUTO_ISSUE_KEY)가 없으면 받지 않습니다.
 *
 *   GET /api/partner/upsell-customers?since=ISO시각   (그 시각 이후 새로 생기거나 바뀐 것, 없으면 최근 3일)
 *   한 번에 표마다 최대 2,000줄(바뀐 시각 순). 더 있으면 more: true · next(다음 since) — 오피스가 이어 받는다.
 *   지운 신청 · 회원도 deleted: true 로 보낸다 — 오피스가 그 줄을 대상에서 뺀다.
 *
 * 신청 구분: 오피스 자동 발급이 만든 신청(메모 「학점연계 자동발급」 · 회원 가입 경로 「학점연계 자동발급」)은 학점연계,
 * 나머지는 후납(선후납) — 과정별 통계(course-stats.service)와 같은 기준입니다.
 */
export const dynamic = "force-dynamic";

const OFFICE_JOIN_PATH = "학점연계 자동발급";
const MAX_RANGE_DAYS = 400;
const LIMIT = 2000;

/** 바뀐 시각 순으로 최대 LIMIT 줄 — 1,000줄씩 이어 받는다(PostgREST 한도) */
async function upTo<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let from = 0; from < LIMIT; from += 1000) {
    const { data, error } = await page(from, Math.min(from + 999, LIMIT - 1));
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

/** 주소 앞 우편번호(「12345 」 · 「(12345) 」)를 뗀다 — 지역을 읽을 수 있게 */
const stripZip = (v: string | null) => v?.replace(/^\(?\d{5}\)?\s*/, "").trim() || null;

/** 비밀키 비교 — 글자 하나씩 걸리는 시간으로 키를 추측하지 못하게 상수 시간으로 */
const sameKey = (given: string | null | undefined, expected: string) => {
  const a = Buffer.from(given?.trim() ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** since — 읽을 수 있는 시각만, 너무 먼 과거(400일 넘게)는 잘라 한 번에 전부 내려가지 않게 */
const pickSince = (value: string | null) => {
  const fallback = new Date(Date.now() - 3 * 86_400_000);
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  const floor = new Date(Date.now() - MAX_RANGE_DAYS * 86_400_000);
  return date < floor ? floor : date;
};

type ApplicationRow = {
  id: string;
  applied_at: string;
  certificate_name: string;
  member_login_id: string;
  applicant_name: string;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  address_detail: string | null;
  actual_payment_amount: number;
  payment_method: string | null;
  payment_status: string;
  delivery_status: string;
  memo: string | null;
  updated_at: string;
  deleted_at: string | null;
  member: { join_path: string | null; marketing_agreed: boolean | null; phone: string | null; tel: string | null } | null;
};

type MemberRow = {
  id: string;
  login_id: string;
  name: string;
  phone: string | null;
  tel: string | null;
  address: string | null;
  address_detail: string | null;
  birth_date: string | null;
  joined_at: string;
  status: string;
  join_path: string | null;
  marketing_agreed: boolean | null;
  updated_at: string;
  deleted_at: string | null;
};

export async function GET(request: Request) {
  const expected = process.env.PARTNER_AUTO_ISSUE_KEY?.trim();
  if (!expected) {
    return NextResponse.json(
      { success: false, message: "PARTNER_AUTO_ISSUE_KEY 가 설정되지 않았습니다." },
      { status: 503 },
    );
  }
  if (!sameKey(request.headers.get("x-partner-key"), expected)) {
    return NextResponse.json({ success: false, message: "인증 실패" }, { status: 401 });
  }

  const since = pickSince(new URL(request.url).searchParams.get("since")).toISOString();
  const until = new Date().toISOString();

  try {
    const supabase = await createClient();
    const applications = await upTo<ApplicationRow>((from, to) =>
      supabase
        .from("certificate_applications")
        .select(
          "id, applied_at, certificate_name, member_login_id, applicant_name, birth_date, phone, address, address_detail, actual_payment_amount, payment_method, payment_status, delivery_status, memo, updated_at, deleted_at, member:members ( join_path, marketing_agreed, phone, tel )",
        )
        .gte("updated_at", since)
        .order("updated_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to) as unknown as PromiseLike<{ data: ApplicationRow[] | null; error: { message: string } | null }>,
    );
    const members = await upTo<MemberRow>((from, to) =>
      supabase
        .from("members")
        .select("id, login_id, name, phone, tel, address, address_detail, birth_date, joined_at, status, join_path, marketing_agreed, updated_at, deleted_at")
        .gte("updated_at", since)
        .order("updated_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to) as unknown as PromiseLike<{ data: MemberRow[] | null; error: { message: string } | null }>,
    );

    // 어느 표든 한도에 닿으면 — 두 표 중 더 이른 마지막 시각부터 다시 받게 한다(겹친 줄은 오피스가 같은 줄로 합친다)
    const lastOf = (rows: { updated_at: string }[]) => (rows.length >= LIMIT ? rows[rows.length - 1].updated_at : null);
    const cut = [lastOf(applications), lastOf(members)].filter((v): v is string => !!v).sort()[0] ?? null;

    const joinAddress = (main: string | null, detail: string | null) =>
      [stripZip(main), detail?.trim()].filter(Boolean).join(" ") || null;

    return NextResponse.json({
      success: true,
      since,
      until: cut ?? until,
      more: !!cut,
      next: cut,
      applications: applications.map((a) => ({
        id: a.id,
        deleted: !!a.deleted_at,
        kind:
          a.member?.join_path === OFFICE_JOIN_PATH || a.memo?.startsWith(OFFICE_JOIN_PATH) ? "credit_link" : "prepaid",
        appliedAt: a.applied_at,
        certificateName: a.certificate_name?.normalize("NFC").trim() ?? "",
        loginId: a.member_login_id,
        name: a.applicant_name,
        birthDate: a.birth_date,
        phone: a.phone || a.member?.phone || a.member?.tel || null,
        address: joinAddress(a.address, a.address_detail),
        amount: a.actual_payment_amount,
        paymentMethod: a.payment_method,
        paymentStatus: a.payment_status,
        deliveryStatus: a.delivery_status,
        marketingAgreed: a.member?.marketing_agreed === true,
      })),
      members: members.map((m) => ({
        id: m.id,
        deleted: !!m.deleted_at,
        loginId: m.login_id,
        name: m.name,
        phone: m.phone || m.tel || null,
        address: joinAddress(m.address, m.address_detail),
        birthDate: m.birth_date,
        joinedAt: m.joined_at,
        status: m.status,
        joinPath: m.join_path,
        marketingAgreed: m.marketing_agreed === true,
      })),
    });
  } catch (error) {
    console.error("[partner/upsell-customers] 실패:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "자격증 신청 · 회원을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
