import { redirect } from 'next/navigation';

import { getClassroomCourseLectures } from '@/features/classroom-lectures/services/classroom-lecture.service';
import { getMockableStudentMember } from '@/lib/mock-auth-server';

type PageProps = { params: Promise<{ course: string }> };

/**
 * 강의실 입장 — 이어볼 차시로 보냅니다.
 * 아직 시작 안 한 첫 차시(없으면 1강)를 골라 재생 화면으로 넘깁니다.
 */
export default async function Page({ params }: PageProps) {
  const { course } = await params;
  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/lecture/${course}`);
  }

  const lectures = await getClassroomCourseLectures(member.id, course);
  if (!lectures || lectures.sessions.length === 0) {
    redirect('/mylecture');
  }

  const resume =
    lectures.sessions.find((s) => s.status === 'in_progress') ??
    lectures.sessions.find((s) => s.status !== 'completed') ??
    lectures.sessions[0];

  redirect(`/lecture/${course}/${resume.order}`);
}
