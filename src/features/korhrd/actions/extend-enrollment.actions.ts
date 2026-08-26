"use server";

import { createClient } from "@/lib/supabase/server";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/** 1회 연장 시 늘어나는 수강기간(일). 나의 강의실 안내 문구와 같은 값입니다. */
const EXTEND_DAYS = 30;

export type ExtendEnrollmentResult =
  | { success: true; endDate: string; extendCount: number }
  | { success: false; message: string };

/**
 * 나의 강의실 "기간 연장"/"연장하기" — 본인 수강의 end_date를 30일 뒤로 미룹니다.
 * 횟수 제한 없음(extend_count는 기록용). 로그인 세션에서 회원을 직접 조회하므로
 * 남의 수강은 연장할 수 없습니다.
 */
export async function extendMyEnrollmentAction(input: {
  courseCode: string;
}): Promise<ExtendEnrollmentResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("code", input.courseCode)
    .is("deleted_at", null)
    .maybeSingle();
  if (!course) {
    return { success: false, message: "과정을 찾을 수 없습니다." };
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, end_date, extend_count")
    .eq("member_id", member.id)
    .eq("course_id", course.id)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();
  if (!enrollment) {
    return { success: false, message: "수강 내역을 찾을 수 없습니다." };
  }

  // toISOString()은 UTC로 바뀌며 하루가 밀릴 수 있어 로컬 날짜 성분으로 직접 만듭니다
  const extended = new Date(`${enrollment.end_date.slice(0, 10)}T00:00:00`);
  extended.setDate(extended.getDate() + EXTEND_DAYS);
  const newEndDate = [
    extended.getFullYear(),
    String(extended.getMonth() + 1).padStart(2, "0"),
    String(extended.getDate()).padStart(2, "0"),
  ].join("-");

  const { error } = await supabase
    .from("enrollments")
    .update({ end_date: newEndDate, extend_count: enrollment.extend_count + 1 })
    .eq("id", enrollment.id);
  if (error) {
    return { success: false, message: "연장 처리에 실패했습니다. 잠시 후 다시 시도해주세요." };
  }

  return { success: true, endDate: newEndDate, extendCount: enrollment.extend_count + 1 };
}
