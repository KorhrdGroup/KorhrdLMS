import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ClassroomPage } from "@/components/classroom/classroom-page";
import {
  getMyActiveEnrollments,
  getMyPendingEnrollments,
} from "@/features/enrollment-catalog/services/my-enrollments.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "학습강의실",
  description: "한평생 직업훈련센터 학습강의실",
};

export default async function Page() {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect("/login?redirect=/classroom");
  }

  let pendingEnrollments: Awaited<ReturnType<typeof getMyPendingEnrollments>> = [];
  let activeEnrollments: Awaited<ReturnType<typeof getMyActiveEnrollments>> = [];
  try {
    [pendingEnrollments, activeEnrollments] = await Promise.all([
      getMyPendingEnrollments(member.id),
      getMyActiveEnrollments(member.id),
    ]);
  } catch {
    pendingEnrollments = [];
    activeEnrollments = [];
  }

  return <ClassroomPage pendingEnrollments={pendingEnrollments} activeEnrollments={activeEnrollments} />;
}
