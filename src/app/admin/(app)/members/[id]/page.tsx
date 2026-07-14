import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getEnrollmentRecordsForMember } from "@/features/enrollments/services/enrollment-record-list.service";
import { getGradeRecordsForMember } from "@/features/grades/services/grade-list.service";
import { MemberDetailView } from "@/features/members/components/member-detail-view";
import { getMemberDetail } from "@/features/members/services/member-detail.service";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MemberDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getMemberDetail(id);

  if (!result.success) {
    return { title: "회원 상세" };
  }

  return {
    title: `${result.member.name} · 회원 상세`,
  };
}

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = await params;

  try {
    const result = await getMemberDetail(id);

    if (!result.success) {
      notFound();
    }

    const [enrollments, grades] = await Promise.all([
      getEnrollmentRecordsForMember(id),
      getGradeRecordsForMember(id),
    ]);

    return (
      <MemberDetailView member={result.member} enrollments={enrollments} grades={grades} />
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">회원 상세</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
        <p className="mt-4 text-sm text-[#6B7280]">
          Supabase 연결 및 `supabase/migrations` 실행 후 다시 시도해주세요.
        </p>
      </div>
    );
  }
}
