"use server";

import {
  applyForCourse,
  sendEnrollmentDoneAlimtalk,
} from "@/features/enrollment-catalog/services/enrollment-application.service";
import { createClient } from "@/lib/supabase/server";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * korhrd 디자인 장바구니의 "선택과목 수강신청".
 *
 * 장바구니는 과정 "이름"(전달본 Course.n, "생활지원사 1급" 형태)을 담고 있어서
 * 이름 → 과정을 찾은 뒤(급수·띄어쓰기 차이 흡수) 기존 수강신청 서비스로 넣습니다.
 * 회원은 세션에서 직접 조회하므로 클라이언트가 memberId를 조작할 수 없습니다.
 */
export type CartApplyResult =
  | { success: false; code: "unauthenticated"; message: string }
  | {
      success: true;
      applied: string[];
      duplicated: string[];
      failed: { name: string; message: string }[];
    };

const normalize = (value: string) => value.replace(/\s+/g, "").replace(/\d급$/, "");

export async function applyCartAction(input: { courses: string[] }): Promise<CartApplyResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return {
      success: false,
      code: "unauthenticated",
      message: "수강신청을 위해서는 로그인이 필요합니다.",
    };
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("courses")
    .select("id, name")
    .eq("status", "active")
    .is("deleted_at", null);
  const byName = new Map((rows ?? []).map((row) => [normalize(row.name), row]));

  const applied: string[] = [];
  const duplicated: string[] = [];
  const failed: { name: string; message: string }[] = [];

  for (const name of input.courses) {
    const course = byName.get(normalize(name));
    if (!course) {
      failed.push({ name, message: "과정을 찾을 수 없습니다." });
      continue;
    }
    const result = await applyForCourse({ memberId: member.id, courseId: course.id });
    if (result.success) {
      applied.push(name);
    } else if (result.code === "duplicate") {
      duplicated.push(name);
    } else {
      failed.push({ name, message: result.message });
    }
  }

  // 한 과목이라도 신청됐으면 완료 알림톡 한 통 (여러 과목이어도 한 번만)
  if (applied.length > 0) {
    await sendEnrollmentDoneAlimtalk(member.id);
  }

  return { success: true, applied, duplicated, failed };
}
