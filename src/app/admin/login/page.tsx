import type { Metadata } from "next";

import { AdminAuthLayout } from "@/components/admin/admin-auth-layout";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "로그인",
};

export default function AdminLoginPage() {
  return (
    <AdminAuthLayout>
      <LoginForm />
    </AdminAuthLayout>
  );
}
