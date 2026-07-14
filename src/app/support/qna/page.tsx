import type { Metadata } from "next";

import { QnaPage } from "@/components/support/qna-page";
import { requireMockLogin } from "@/lib/mock-auth";

export const metadata: Metadata = {
  title: "1:1 상담",
  description: "한평생 직업훈련센터 1:1 상담",
};

/**
 * Mock access control: 1:1 상담 is member-only in the existing LMS.
 * Logged-out visitors are bounced to /login with a redirect target so the
 * real auth flow (once connected) can send them straight back here.
 */
export default function Page() {
  requireMockLogin("/support/qna");

  return <QnaPage />;
}
