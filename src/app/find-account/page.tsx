import type { Metadata } from "next";

import { FindAccountPage } from "@/components/auth/find-account-page";

export const metadata: Metadata = {
  title: "아이디/비밀번호 찾기",
  description: "한평생직업훈련 아이디/비밀번호 찾기",
};

export default function Page() {
  return <FindAccountPage />;
}
