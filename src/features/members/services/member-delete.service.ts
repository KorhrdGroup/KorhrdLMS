import { createClient } from "@/lib/supabase/server";

export type MemberDeleteResult =
  | { success: true; deletedCount: number }
  | { success: false; message: string };

export async function softDeleteMembers(
  memberIds: string[],
): Promise<MemberDeleteResult> {
  const ids = [...new Set(memberIds.map((id) => id.trim()).filter(Boolean))];

  if (ids.length === 0) {
    return { success: false, message: "삭제할 회원을 선택해주세요." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .update({ deleted_at: deletedAt })
    .in("id", ids)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  const deletedCount = data?.length ?? 0;

  if (deletedCount === 0) {
    return {
      success: false,
      message: "삭제할 수 있는 회원이 없습니다.",
    };
  }

  return { success: true, deletedCount };
}
