import { AdminLayoutProvider } from "@/components/admin/layout/admin-layout-provider";
import { AdminShell } from "@/components/admin/layout/admin-shell";

export default function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLayoutProvider>
  );
}
