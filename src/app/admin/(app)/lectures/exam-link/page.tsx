import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";

export const metadata: Metadata = {
  title: "시험 연결 | 강의관리",
};

export default function LectureExamLinkPage() {
  return (
    <AdminComingSoon
      title="시험 연결"
      description="강의 차시에 온라인 시험을 연결하는 기능은 준비 중입니다."
    />
  );
}
