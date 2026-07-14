import { cookies } from "next/headers";

import { verifyPassword } from "@/lib/shared/password";
import { createClient } from "@/lib/supabase/server";
import type {
  StudentLoginInput,
  StudentLoginResult,
} from "@/features/auth/types/student-auth.types";
import { STUDENT_SESSION_COOKIE } from "@/lib/student/session";

export async function authenticateMember(
  input: StudentLoginInput,
): Promise<StudentLoginResult> {
  const loginId = input.loginId.trim();

  if (!loginId || !input.password) {
    return {
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, login_id, name, password_hash, status, deleted_at")
    .eq("login_id", loginId)
    .maybeSingle();

  if (error || !data || data.deleted_at) {
    return {
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  if (data.status !== "active") {
    return {
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  if (!data.password_hash || !verifyPassword(input.password, data.password_hash)) {
    return {
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const { error: updateError } = await supabase
    .from("members")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", data.id);

  if (updateError) {
    return {
      success: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  return {
    success: true,
    member: {
      id: data.id,
      loginId: data.login_id,
      name: data.name,
    },
  };
}

export async function getStudentSessionMember() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!memberId) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, login_id, name, status, deleted_at")
    .eq("id", memberId)
    .maybeSingle();

  if (error || !data || data.deleted_at || data.status !== "active") {
    return null;
  }

  return {
    id: data.id,
    loginId: data.login_id,
    name: data.name,
  };
}
