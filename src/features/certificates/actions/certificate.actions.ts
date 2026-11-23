"use server";

import {
  createCertificateApplicationByAdmin,
  type CreateCertificateApplicationInput,
  type CreateCertificateApplicationResult,
} from "@/features/certificates/services/certificate-create.service";
import { buildCertificateExportXlsx } from "@/features/certificates/services/certificate-export.service";
import { getOfficeStaff, searchOfficeStudents, type OfficeStudent } from "@/features/certificates/services/office-notify";
import {
  lookupMemberForCertificate,
  type CertificateMemberLookupResult,
} from "@/features/certificates/services/certificate-member-lookup.service";
import { getCurrentAdminLoginId, isBabyAdmin } from "@/lib/admin/current-admin";
import { getCertificateDetail } from "@/features/certificates/services/certificate-detail.service";
import {
  bumpCertificateApplication,
  deleteCertificateApplication,
  updateCertificateApplication,
} from "@/features/certificates/services/certificate-mutation.service";
import type {
  CertificateDeleteResult,
  CertificateMutationResult,
  CertificateUpdateInput,
} from "@/features/certificates/types/certificate-form.types";
import type {
  CertificateListQuery,
  GetCertificateDetailResult,
} from "@/features/certificates/types/certificate.types";
import { todayInKst } from "@/lib/shared/kst-date";

export async function getCertificateDetailAction(
  applicationId: string,
): Promise<GetCertificateDetailResult> {
  return getCertificateDetail(applicationId);
}

export async function updateCertificateApplicationAction(
  applicationId: string,
  input: CertificateUpdateInput,
): Promise<CertificateMutationResult> {
  return updateCertificateApplication(applicationId, input);
}

export async function deleteCertificateApplicationAction(
  applicationId: string,
): Promise<CertificateDeleteResult> {
  return deleteCertificateApplication(applicationId);
}

export async function exportCertificateApplicationsAction(
  query: CertificateListQuery,
): Promise<
  { success: true; xlsxBase64: string; filename: string } | { success: false; message: string }
> {
  try {
    const xlsxBase64 = await buildCertificateExportXlsx(query);
    /* 서버는 UTC 라 new Date() 로 하면 한국시간 00~09시에 전날 날짜가 붙습니다 */
    const datePart = todayInKst().replaceAll("-", "");

    return {
      success: true,
      xlsxBase64,
      filename: `자격증_${datePart}.xlsx`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Excel 다운로드에 실패했습니다.",
    };
  }
}

export async function bumpCertificateApplicationAction(
  applicationId: string,
): Promise<CertificateMutationResult> {
  return bumpCertificateApplication(applicationId);
}

/** 발급신청 추가 창 자동 채우기 — 아이디로 회원 이름 · 생년월일 · 연락처 · 주소 (아기관리자 불가) */
export async function lookupMemberForCertificateAction(loginId: string): Promise<CertificateMemberLookupResult> {
  try {
    return await lookupMemberForCertificate(loginId);
  } catch {
    return { found: false, message: "회원 정보를 읽지 못했습니다." };
  }
}

/** 발급신청 추가 창 — 이름 · 전화번호로 오피스 「민간자격증」 탭 학생 찾기 (아기관리자 불가) */
export async function searchOfficeStudentsAction(q: string): Promise<{ students: OfficeStudent[]; error: string | null }> {
  if (!(await getCurrentAdminLoginId()) || (await isBabyAdmin())) {
    return { students: [], error: "권한이 없습니다." };
  }
  return searchOfficeStudents(q);
}

/** 발급신청 추가 창의 담당자 고르기 — 오피스 재직 직원 이름 (아기관리자 불가) */
export async function getOfficeStaffAction(): Promise<{ staff: string[]; error: string | null }> {
  if (!(await getCurrentAdminLoginId()) || (await isBabyAdmin())) {
    return { staff: [], error: "권한이 없습니다." };
  }
  return getOfficeStaff();
}

/** 발급신청 추가 — 관리자가 직접 신청 건을 만듭니다 (아기관리자 불가) */
export async function createCertificateApplicationAction(
  input: CreateCertificateApplicationInput,
): Promise<CreateCertificateApplicationResult> {
  try {
    return await createCertificateApplicationByAdmin(input);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "발급신청 추가에 실패했습니다.",
    };
  }
}
