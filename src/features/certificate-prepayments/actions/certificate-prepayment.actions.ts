"use server";

import { fetchCertificatePrepaymentCourseOptions } from "@/features/certificate-prepayments/services/certificate-prepayment-list.service";
import {
  createCertificatePrepayment,
  deleteCertificatePrepayment,
  updateCertificatePrepayment,
} from "@/features/certificate-prepayments/services/certificate-prepayment-mutation.service";
import type {
  CertificatePrepaymentCourseOption,
  CertificatePrepaymentDeleteResult,
  CertificatePrepaymentFormInput,
  CertificatePrepaymentMutationResult,
} from "@/features/certificate-prepayments/types/certificate-prepayment.types";

export async function createCertificatePrepaymentAction(
  input: CertificatePrepaymentFormInput,
): Promise<CertificatePrepaymentMutationResult> {
  return createCertificatePrepayment(input);
}

export async function updateCertificatePrepaymentAction(
  prepaymentId: string,
  input: CertificatePrepaymentFormInput,
): Promise<CertificatePrepaymentMutationResult> {
  return updateCertificatePrepayment(prepaymentId, input);
}

export async function deleteCertificatePrepaymentAction(
  prepaymentId: string,
): Promise<CertificatePrepaymentDeleteResult> {
  return deleteCertificatePrepayment(prepaymentId);
}

export async function getCertificatePrepaymentCourseOptionsAction(): Promise<
  CertificatePrepaymentCourseOption[]
> {
  return fetchCertificatePrepaymentCourseOptions();
}
