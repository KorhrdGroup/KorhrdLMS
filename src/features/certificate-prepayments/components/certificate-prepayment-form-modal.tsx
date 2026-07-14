"use client";

import { useEffect, useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  createCertificatePrepaymentAction,
  getCertificatePrepaymentCourseOptionsAction,
  updateCertificatePrepaymentAction,
} from "@/features/certificate-prepayments/actions/certificate-prepayment.actions";
import {
  CERTIFICATE_PREPAYMENT_DEFAULT_AMOUNT,
  CERTIFICATE_PREPAYMENT_PAYMENT_STATUS_OPTIONS,
} from "@/features/certificate-prepayments/constants";
import type {
  CertificatePrepaymentCourseOption,
  CertificatePrepaymentFormInput,
  CertificatePrepaymentListItem,
} from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { EnrollmentFormField } from "@/features/enrollments/components/enrollment-form-field";
import { PAYMENT_METHOD_LABELS } from "@/features/payments/constants";
import type { PaymentMethod, PaymentStatus } from "@/types/database.types";

type CertificatePrepaymentFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: CertificatePrepaymentListItem | null;
  onSaved?: (message: string) => void;
};

const EMPTY_FORM: CertificatePrepaymentFormInput = {
  memberLoginId: "",
  courseId: "",
  certificateName: "",
  amount: CERTIFICATE_PREPAYMENT_DEFAULT_AMOUNT,
  paymentMethod: "",
  paymentStatus: "paid",
  paidAt: new Date().toISOString().slice(0, 10),
  memo: "",
};

const selectClassName =
  "h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30";

export function CertificatePrepaymentFormModal({
  open,
  onOpenChange,
  target,
  onSaved,
}: CertificatePrepaymentFormModalProps) {
  const [form, setForm] = useState<CertificatePrepaymentFormInput>(EMPTY_FORM);
  const [courseOptions, setCourseOptions] = useState<CertificatePrepaymentCourseOption[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();
  const [, startInit] = useTransition();

  const isEditMode = Boolean(target);

  useEffect(() => {
    if (!open) {
      return;
    }

    startInit(async () => {
      setFormError(null);
      setForm(
        target
          ? {
              memberLoginId: target.memberLoginId,
              courseId: target.courseId ?? "",
              certificateName: target.certificateName,
              amount: target.amount,
              paymentMethod: target.paymentMethod ?? "",
              paymentStatus: target.paymentStatus,
              paidAt: target.paidAt ?? "",
              memo: target.memo ?? "",
            }
          : EMPTY_FORM,
      );

      try {
        const options = await getCertificatePrepaymentCourseOptionsAction();
        setCourseOptions(options);
      } catch {
        setCourseOptions([]);
      }
    });
  }, [open, target]);

  function updateField<K extends keyof CertificatePrepaymentFormInput>(
    key: K,
    value: CertificatePrepaymentFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFormError(null);
    }
  }

  function handleSave() {
    startSubmit(async () => {
      setFormError(null);

      try {
        const result = target
          ? await updateCertificatePrepaymentAction(target.id, form)
          : await createCertificatePrepaymentAction(form);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        handleOpenChange(false);
        onSaved?.(result.message);
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "선납결제 저장에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditMode ? "선납결제 수정" : "선납결제 등록"}
      description="학생이 미리 결제한 자격증 발급비 내역을 등록/관리합니다. 확인된 입금 건만 등록해주세요."
      className="sm:max-w-lg"
      footer={
        <div className="flex w-full flex-col gap-2">
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-xs text-[#EF4444]">
              {formError}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <AdminButton type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </AdminButton>
            <AdminButton type="button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <EnrollmentFormField label="학생 아이디(로그인ID)" htmlFor="memberLoginId" required>
          <AdminInput
            id="memberLoginId"
            variant="outline"
            value={form.memberLoginId}
            onChange={(event) => updateField("memberLoginId", event.target.value)}
            placeholder="student01"
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="선납 대상 과정(선택)" htmlFor="courseId">
          <select
            id="courseId"
            value={form.courseId}
            onChange={(event) => updateField("courseId", event.target.value)}
            className={selectClassName}
          >
            <option value="">전체 과정(무관)</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </EnrollmentFormField>

        <EnrollmentFormField
          label="선납 과정/자격증명"
          htmlFor="certificateName"
          required
          className="sm:col-span-2"
        >
          <AdminInput
            id="certificateName"
            variant="outline"
            value={form.certificateName}
            onChange={(event) => updateField("certificateName", event.target.value)}
            placeholder="예: 인공지능 실무 자격증"
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="선납금액" htmlFor="amount" required>
          <AdminInput
            id="amount"
            type="number"
            min={0}
            variant="outline"
            value={form.amount}
            onChange={(event) => updateField("amount", Number(event.target.value))}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="선납일" htmlFor="paidAt">
          <AdminInput
            id="paidAt"
            type="date"
            variant="outline"
            value={form.paidAt}
            onChange={(event) => updateField("paidAt", event.target.value)}
          />
        </EnrollmentFormField>

        <EnrollmentFormField label="결제방법" htmlFor="paymentMethod">
          <select
            id="paymentMethod"
            value={form.paymentMethod}
            onChange={(event) => updateField("paymentMethod", event.target.value as PaymentMethod | "")}
            className={selectClassName}
          >
            <option value="">선택 안 함</option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </EnrollmentFormField>

        <EnrollmentFormField label="결제상태" htmlFor="paymentStatus">
          <select
            id="paymentStatus"
            value={form.paymentStatus}
            onChange={(event) => updateField("paymentStatus", event.target.value as PaymentStatus)}
            className={selectClassName}
          >
            {CERTIFICATE_PREPAYMENT_PAYMENT_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {PAYMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </EnrollmentFormField>

        <EnrollmentFormField label="메모" htmlFor="memo" className="sm:col-span-2">
          <AdminInput
            id="memo"
            variant="outline"
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            placeholder="선택 입력"
          />
        </EnrollmentFormField>
      </div>
    </AdminModal>
  );
}
