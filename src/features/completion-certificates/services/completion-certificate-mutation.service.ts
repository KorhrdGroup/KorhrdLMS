import { getCompletionCertificateByEnrollmentId } from "@/features/completion-certificates/services/completion-certificate-list.service";
import {
  cancelCertificateRecord,
  getCertificateRecord,
  issueCertificateRecord,
  reissueCertificateRecord,
} from "@/features/completion-certificates/repositories/completion-certificate.repository";
import type {
  CompletionCertificateActionResult,
  CompletionCertificateListItem,
} from "@/features/completion-certificates/types/completion-certificate.types";

async function loadEligibleItem(
  enrollmentId: string,
): Promise<
  | { success: true; item: CompletionCertificateListItem }
  | { success: false; message: string }
> {
  const item = await getCompletionCertificateByEnrollmentId(enrollmentId);

  if (!item) {
    return {
      success: false,
      message: "수료 조건을 충족한 수강 정보를 찾을 수 없습니다.",
    };
  }

  return { success: true, item };
}

export async function issueCompletionCertificate(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  const loaded = await loadEligibleItem(enrollmentId);
  if (!loaded.success) return loaded;

  if (await getCertificateRecord(enrollmentId)) {
    return { success: false, message: "이미 발급된 수료증입니다. 재발급을 이용해주세요." };
  }

  await issueCertificateRecord(enrollmentId, loaded.item.course.id, loaded.item.member.id);
  const updated = await getCompletionCertificateByEnrollmentId(enrollmentId);

  if (!updated) {
    return { success: false, message: "수료증 발급에 실패했습니다." };
  }

  return { success: true, item: updated, message: "수료증을 발급했습니다." };
}

export async function reissueCompletionCertificate(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  const loaded = await loadEligibleItem(enrollmentId);
  if (!loaded.success) return loaded;

  const reissued = await reissueCertificateRecord(enrollmentId);
  if (!reissued) {
    return {
      success: false,
      message: "발급된 수료증이 없습니다. 먼저 발급해주세요.",
    };
  }

  const updated = await getCompletionCertificateByEnrollmentId(enrollmentId);
  if (!updated) {
    return { success: false, message: "수료증 재발급에 실패했습니다." };
  }

  return {
    success: true,
    item: updated,
    message: `수료증을 재발급했습니다. (재발급 ${updated.reissueCount}회)`,
  };
}

export async function cancelCompletionCertificate(
  enrollmentId: string,
): Promise<CompletionCertificateActionResult> {
  const loaded = await loadEligibleItem(enrollmentId);
  if (!loaded.success) return loaded;

  const canceled = await cancelCertificateRecord(enrollmentId);
  if (!canceled) {
    return { success: false, message: "발급된 수료증이 없습니다." };
  }

  const updated = await getCompletionCertificateByEnrollmentId(enrollmentId);
  if (!updated) {
    return { success: false, message: "수료증 발급취소에 실패했습니다." };
  }

  return { success: true, item: updated, message: "수료증 발급을 취소했습니다." };
}
