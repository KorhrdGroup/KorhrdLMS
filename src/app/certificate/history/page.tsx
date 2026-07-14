import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CertificateApplyShell } from "@/components/certificate/CertificateApplyShell";
import { CertificateHistoryList } from "@/components/certificate/CertificateHistoryList";
import { getMyCertificateApplications } from "@/features/certificate-applications/services/certificate-application.service";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export const metadata: Metadata = {
  title: "자격증발급신청 조회",
  description: "한평생 직업훈련센터 자격증발급신청 조회",
};

export default async function Page() {
  const member = await getMockableStudentMember();

  if (!member) {
    redirect("/login?redirect=/certificate/history");
  }

  const items = await getMyCertificateApplications(member.id);

  return (
    <CertificateApplyShell currentLabel="자격증발급신청 조회">
      <div className="space-y-6">
        <h2 className="text-[22px] font-bold text-[#010101]">자격증발급신청 조회</h2>
        <CertificateHistoryList items={items} />
      </div>
    </CertificateApplyShell>
  );
}
