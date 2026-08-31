import { notFound } from "next/navigation";

import { GradeDetailView } from "@/features/grades/components/grade-detail-view";
import { getGradeDetail } from "@/features/grades/services/grade-detail.service";
import { isBabyAdmin } from "@/lib/admin/current-admin";

type GradeDetailPageProps = {
  params: Promise<{ enrollmentId: string }>;
};

export default async function GradeDetailPage({ params }: GradeDetailPageProps) {
  // 아기관리자는 성적 조작 화면에 들어올 수 없습니다 (조회 전용 계정)
  if (await isBabyAdmin()) {
    notFound();
  }

  const { enrollmentId } = await params;
  const result = await getGradeDetail(enrollmentId);

  if (!result.success) {
    notFound();
  }

  return <GradeDetailView detail={result.detail} />;
}
