import { NextResponse } from "next/server";

import { signProtectedMediaUrl } from "@/lib/r2/signed-url";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * 수강신청 목록 "강의 샘플" — 과정의 1강(첫 차시) 영상만 미리보기로 제공합니다.
 *
 * 로그인 없이 여는 공개 API지만, 서명 URL(2시간 만료)만 내려주므로
 * 1강 외의 영상은 열 수 없고 주소가 퍼져도 금방 만료됩니다.
 * 차시 순서는 학습강의실과 같은 규칙(강의 등록순 → 차시 순서)입니다.
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ success: false, message: "과정 코드가 필요합니다." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, name")
    .eq("code", code)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (!course) {
    return NextResponse.json({ success: false, message: "과정을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: lectures } = await supabase
    .from("course_lectures")
    .select("id")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const lectureIds = (lectures ?? []).map((lecture) => lecture.id);
  if (lectureIds.length === 0) {
    return NextResponse.json({ success: false, message: "샘플 영상이 없습니다." }, { status: 404 });
  }

  // 첫 강의부터 순서대로, 영상이 있는 첫 차시를 찾습니다
  for (const lectureId of lectureIds) {
    const { data: session } = await supabase
      .from("lecture_sessions")
      .select("title, video_url")
      .eq("lecture_id", lectureId)
      .is("deleted_at", null)
      .not("video_url", "is", null)
      .order("session_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (session?.video_url) {
      return NextResponse.json({
        success: true,
        courseName: course.name,
        title: session.title,
        url: signProtectedMediaUrl(session.video_url, 2 * 60 * 60),
      });
    }
  }

  return NextResponse.json({ success: false, message: "샘플 영상이 없습니다." }, { status: 404 });
}
