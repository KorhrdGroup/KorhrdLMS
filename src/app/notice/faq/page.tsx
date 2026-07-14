import type { Metadata } from "next";

import { FaqPage } from "@/components/faq/faq-page";

export const metadata: Metadata = {
  title: "자주하는 질문",
  description: "한평생 직업훈련센터 자주하는 질문(FAQ)",
};

export default function Page() {
  return <FaqPage />;
}
