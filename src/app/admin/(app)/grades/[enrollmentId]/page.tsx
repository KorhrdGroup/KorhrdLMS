import { notFound } from "next/navigation";

import { GradeDetailView } from "@/features/grades/components/grade-detail-view";
import { getGradeDetail } from "@/features/grades/services/grade-detail.service";

type GradeDetailPageProps = {
  params: Promise<{ enrollmentId: string }>;
};

export default async function GradeDetailPage({ params }: GradeDetailPageProps) {
  const { enrollmentId } = await params;
  const result = await getGradeDetail(enrollmentId);

  if (!result.success) {
    notFound();
  }

  return <GradeDetailView detail={result.detail} />;
}
