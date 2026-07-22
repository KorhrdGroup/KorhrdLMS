import { AdminHomePage } from "@/components/admin/pages/admin-home-page";
import { getAdminDashboard } from "@/features/admin-dashboard/services/admin-dashboard.service";

export default async function AdminPage() {
  const dashboard = await getAdminDashboard();

  return <AdminHomePage dashboard={dashboard} />;
}
