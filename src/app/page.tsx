import type { Metadata } from "next";

import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  title: "한평생 직업훈련",
  description: "한평생직업훈련센터 - 국가지정등록 자격취득과정",
};

export default function Page() {
  return <HomePage />;
}
