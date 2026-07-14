"use server";

import {
  cancelCompletionCertificate,
  issueCompletionCertificate,
  reissueCompletionCertificate,
} from "@/features/completion-certificates/services/completion-certificate-mutation.service";
import type { CompletionCertificateActionResult } from "@/features/completion-certificates/types/completion-certificate.types";

export async function issueCompletionCertificateAction(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  return issueCompletionCertificate(enrollmentId);
}

export async function reissueCompletionCertificateAction(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  return reissueCompletionCertificate(enrollmentId);
}

export async function cancelCompletionCertificateAction(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  return cancelCompletionCertificate(enrollmentId);
}
