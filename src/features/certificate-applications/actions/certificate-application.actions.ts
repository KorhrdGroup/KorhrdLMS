"use server";

import { submitCertificateApplication } from "@/features/certificate-applications/services/certificate-application.service";
import type {
  SubmitCertificateApplicationInput,
  SubmitCertificateApplicationResult,
} from "@/features/certificate-applications/types/certificate-application.types";
// TEMP: getMockableStudentMember falls back to the real Supabase session
// check automatically once MOCK_IS_LOGGED_IN (src/lib/mock-auth.ts) is
// turned off — see that file for details.
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export async function submitCertificateApplicationAction(
  input: SubmitCertificateApplicationInput,
): Promise<SubmitCertificateApplicationResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, code: "not_logged_in", message: "로그인이 필요합니다." };
  }

  return submitCertificateApplication(member.id, input);
}
