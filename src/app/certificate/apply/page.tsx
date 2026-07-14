import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CertificateApplyForm } from "@/components/certificate/CertificateApplyForm";
import { CertificateApplyShell } from "@/components/certificate/CertificateApplyShell";
import { getCertificateApplicationPageData } from "@/features/certificate-applications/services/certificate-application.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "자격증발급신청",
  description: "한평생 직업훈련센터 자격증발급신청",
};

export default async function Page() {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect("/login?redirect=/certificate/apply");
  }

  const pageData = await getCertificateApplicationPageData(member.id);

  if (!pageData) {
    redirect("/login?redirect=/certificate/apply");
  }

  return (
    <CertificateApplyShell currentLabel="자격증발급신청">
      <CertificateApplyForm
        profile={pageData.profile}
        eligibleCourses={pageData.eligibleCourses}
        issuanceCost={pageData.issuanceCost}
      />
    </CertificateApplyShell>
  );
}
