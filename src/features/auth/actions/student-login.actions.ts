"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authenticateMember } from "@/features/auth/services/student-login.service";
import type { StudentLoginInput } from "@/features/auth/types/student-auth.types";
import { STUDENT_SESSION_COOKIE } from "@/lib/student/session";

export async function loginStudentAction(input: StudentLoginInput) {
  const result = await authenticateMember(input);

  if (!result.success) {
    return { success: false as const, message: result.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, result.member.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // 보안상 세션을 24시간으로 제한합니다. 만료 후에는 다시 로그인해야 합니다.
    maxAge: 60 * 60 * 24,
  });

  // Only allow same-origin relative paths as a redirect target (avoid open redirects).
  const isSafeRedirect = input.redirectTo?.startsWith("/") && !input.redirectTo.startsWith("//");
  redirect(isSafeRedirect ? input.redirectTo! : "/classroom");
}

export async function logoutStudentAction() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
  redirect("/");
}
