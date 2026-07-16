import { redirect } from "next/navigation";

import { AdminLayoutProvider } from "@/components/admin/layout/admin-layout-provider";
import { AdminShell } from "@/components/admin/layout/admin-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy에서 1차로 걸러지지만, 렌더 단계에서도 세션을 재확인합니다(이중 방어).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminUser = {
    name: (user.user_metadata?.name as string | undefined) ?? "관리자",
    email: user.email ?? "",
  };

  return (
    <AdminLayoutProvider adminUser={adminUser}>
      <AdminShell>{children}</AdminShell>
    </AdminLayoutProvider>
  );
}
