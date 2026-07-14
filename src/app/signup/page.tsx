import type { Metadata } from "next";

import { SignupPage } from "@/components/auth/signup-page";

export const metadata: Metadata = {
  title: "회원가입",
  description: "한평생직업훈련 회원가입",
};

export default function Page() {
  return <SignupPage />;
}
