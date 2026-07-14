"use server";

import { buildCertificateExportCsv } from "@/features/certificates/services/certificate-export.service";
import { getCertificateDetail } from "@/features/certificates/services/certificate-detail.service";
import {
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
): Promise<{ success: true; csv: string; filename: string } | { success: false; message: string }> {
  try {
    const csv = await buildCertificateExportCsv(query);
    const today = new Date();
    const datePart = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("");

    return {
      success: true,
      csv,
      filename: `certificate_applications_${datePart}.csv`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Excel 다운로드에 실패했습니다.",
    };
  }
}
