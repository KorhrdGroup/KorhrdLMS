import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getClassroomLectureDetail } from '@/features/classroom-lectures/services/classroom-lecture.service';
import { getClassroomCourseMaterials } from '@/features/classroom-materials/services/classroom-material.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

import { LecturePlayer } from '../LecturePlayer';

export const metadata: Metadata = {
  title: '강의실 — 한평생 직업훈련',
  description: '한평생 직업훈련 학습강의실',
};

type PageProps = { params: Promise<{ course: string; order: string }> };

/** 차시 재생 — 접근 권한·차시 데이터는 기존 강의실 서비스가 판단합니다. */
export default async function Page({ params }: PageProps) {
  const { course, order } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/lecture/${course}/${order}`);
  }

  let detail: Awaited<ReturnType<typeof getClassroomLectureDetail>> = null;
  try {
    detail = await getClassroomLectureDetail(member.id, course, Number(order));
  } catch (error) {
    // 원인을 삼키면 "강의를 열 수 없습니다"만 보여 디버깅이 어렵습니다.
    console.error("[lecture] getClassroomLectureDetail 실패", course, order, error instanceof Error ? error.message : String(error));
    detail = null;
  }

  if (!detail) {
    return (
      <div className="container">
        <div className="page-head"><h1>강의실</h1></div>
        <div className="guide-box">
          <strong>강의를 열 수 없습니다</strong>
          <ul>
            <li>수강 승인이 완료된 과정만 학습할 수 있습니다.</li>
            <li>차시 번호가 올바른지 확인해 주세요.</li>
          </ul>
        </div>
        <p className="rv-cta"><a className="btn btn--primary" href="/mylecture">나의 강의실로</a></p>
      </div>
    );
  }

  // 학습자료(교안·기출문제)는 관리자 자료실에 공개된 것만 내려옵니다.
  const materialList = await getClassroomCourseMaterials(member.id, course);

  return <LecturePlayer detail={detail} materials={materialList?.materials ?? []} />;
}
