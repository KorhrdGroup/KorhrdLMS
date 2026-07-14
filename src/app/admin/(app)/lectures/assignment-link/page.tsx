import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";

export const metadata: Metadata = {
  title: "과제 연결 | 강의관리",
};

export default function LectureAssignmentLinkPage() {
  return (
    <AdminComingSoon
      title="과제 연결"
      description="강의 차시에 과제를 연결하는 기능은 준비 중입니다."
    />
  );
}
