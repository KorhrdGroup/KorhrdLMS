import type { Metadata } from "next";

import {
  ReferralLinkGenerator,
  type ReferralLinkCourseOption,
} from "@/features/others/referral-links/components/referral-link-generator";
import { M } from "@/features/courses/lib/course-design";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "유입 링크 생성기 | 운영관리",
};

export default async function ReferralLinksPage() {
  // 노출 중인 과정만 — 상세페이지로 보내는 링크 후보입니다
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("code, name")
    .is("deleted_at", null)
    .eq("status", "active")
    .order("name");

  const courses = (data ?? []) as ReferralLinkCourseOption[];

  return (
    <div style={{ background: "#fff", color: M.text, margin: -24, padding: 24, minHeight: "calc(100% + 48px)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: M.mute, marginBottom: 8 }}>
          운영관리 <span style={{ margin: "0 4px" }}>/</span>
          <span style={{ color: M.ink, fontWeight: 600 }}>유입 링크 생성기</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: M.ink }}>유입 링크 생성기</div>
        <div style={{ fontSize: 13, color: M.mute, marginTop: 4 }}>
          카페·SNS 에 올릴 추적 링크를 만듭니다. 이 링크로 들어와 가입한 회원은 회원관리에 유입경로가 표시됩니다.
        </div>
      </div>

      <ReferralLinkGenerator courses={courses} />
    </div>
  );
}
