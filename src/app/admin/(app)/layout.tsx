import { redirect } from "next/navigation";

import { AdminLayoutProvider } from "@/components/admin/layout/admin-layout-provider";
import { AdminShell } from "@/components/admin/layout/admin-shell";
import type { AdminRole } from "@/lib/admin/navigation";
import { createAuthClient, createClient } from "@/lib/supabase/server";

export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  let role: AdminRole = "admin";
  try {
    const db = await createClient();
    const { data: adminRow } = await db
      .from("admin_users")
      .select("admin_type")
      .eq("login_id", user.email ?? "")
      .maybeSingle();
    if (adminRow?.admin_type) {
      role = adminRow.admin_type as AdminRole;
    }
  } catch {
    // DB 조회 실패 시 기본 admin 역할 유지
  }

  const adminUser = {
    name: (user.user_metadata?.name as string | undefined) ?? "관리자",
    email: user.email ?? "",
    role,
  };

  return (
    <AdminLayoutProvider adminUser={adminUser}>
      <AdminShell>{children}</AdminShell>
    </AdminLayoutProvider>
  );
}
