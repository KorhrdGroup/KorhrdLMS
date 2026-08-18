"use server";

import { buildCertificateExportXlsx } from "@/features/certificates/services/certificate-export.service";
import { getCertificateDetail } from "@/features/certificates/services/certificate-detail.service";
import {
  deleteCertificateApplication,
  setCertificatePinned,
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

export async function setCertificatePinnedAction(
  applicationId: string,
  pinned: boolean,
): Promise<CertificateMutationResult> {
  return setCertificatePinned(applicationId, pinned);
}
