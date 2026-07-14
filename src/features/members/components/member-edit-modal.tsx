"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  getMemberForEditAction,
  updateMemberAction,
} from "@/features/members/actions/member-edit.actions";
import {
  MemberFormField,
  MemberFormSection,
  MemberFormSelect,
  MemberFormTextarea,
} from "@/features/members/components/member-form-field";
import { MEMBER_STATUS_LABELS } from "@/features/members/constants";
import type {
  MemberEditDetail,
  MemberEditInput,
} from "@/features/members/types/member-edit.types";
import type { MemberStatus } from "@/types/database.types";

type MemberEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
};

function createFormFromMember(member: MemberEditDetail): MemberEditInput {
  return {
    name: member.name,
    phone: member.phone,
    email: member.email,
    status: member.status,
    managerName: member.managerName,
    postalCode: member.postalCode,
    address: member.address,
    addressDetail: member.addressDetail,
    birthDate: member.birthDate,
    memo: member.memo,
  };
}

export function MemberEditModal({
  open,
  onOpenChange,
  memberId,
}: MemberEditModalProps) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [form, setForm] = useState<MemberEditInput | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MemberEditInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, startLoad] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  useEffect(() => {
    if (!open || !memberId) {
      return;
    }

    startLoad(async () => {
      setForm(null);
      setLoginId("");
      setFieldErrors({});
      setFormError(null);

      try {
        const result = await getMemberForEditAction(memberId);

        if (!result.success) {
          setFormError(result.message);
          return;
        }

        setLoginId(result.member.loginId);
        setForm(createFormFromMember(result.member));
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "회원 정보를 불러오지 못했습니다.",
        );
      }
    });
  }, [open, memberId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setForm(null);
      setLoginId("");
      setFieldErrors({});
      setFormError(null);
    }
  }

  function updateField<K extends keyof MemberEditInput>(
    key: K,
    value: MemberEditInput[K],
  ) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!memberId || !form) {
      return;
    }

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await updateMemberAction(memberId, form);

        if (!result.success) {
          if (result.field) {
            setFieldErrors((current) => ({
              ...current,
              [result.field!]: result.message,
            }));
          }
          setFormError(result.message);
          return;
        }

        handleOpenChange(false);
        router.refresh();
      } catch (error) {
        setFormError(
          error instanceof Error ? error.message : "회원 수정에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="회원수정"
      description="회원 정보를 수정하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-3xl"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            취소
          </AdminButton>
          <AdminButton
            type="submit"
            form="member-edit-form"
            disabled={isSubmitting || isLoading || !form}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#6B7280]">
          회원 정보를 불러오는 중...
        </div>
      ) : form ? (
        <form
          id="member-edit-form"
          className="max-h-[min(60vh,640px)] space-y-6 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          {formError ? (
            <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
              {formError}
            </p>
          ) : null}

          <MemberFormSection title="기본 정보">
            <MemberFormField label="아이디">
              <AdminInput variant="outline" value={loginId} disabled />
            </MemberFormField>

            <MemberFormField
              label="이름"
              htmlFor="edit-name"
              required
              error={fieldErrors.name}
            >
              <AdminInput
                id="edit-name"
                variant="outline"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </MemberFormField>

            <MemberFormField
              label="연락처"
              htmlFor="edit-phone"
              error={fieldErrors.phone}
            >
              <AdminInput
                id="edit-phone"
                variant="outline"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="010-0000-0000"
              />
            </MemberFormField>

            <MemberFormField
              label="이메일"
              htmlFor="edit-email"
              error={fieldErrors.email}
            >
              <AdminInput
                id="edit-email"
                type="email"
                variant="outline"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="example@email.com"
              />
            </MemberFormField>

            <MemberFormField label="상태" htmlFor="edit-status">
              <MemberFormSelect
                id="edit-status"
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value as MemberStatus)
                }
              >
                {Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </MemberFormSelect>
            </MemberFormField>

            <MemberFormField
              label="담당자"
              htmlFor="edit-managerName"
              error={fieldErrors.managerName}
            >
              <AdminInput
                id="edit-managerName"
                variant="outline"
                value={form.managerName}
                onChange={(event) =>
                  updateField("managerName", event.target.value)
                }
              />
            </MemberFormField>

            <MemberFormField
              label="생년월일"
              htmlFor="edit-birthDate"
              error={fieldErrors.birthDate}
            >
              <AdminInput
                id="edit-birthDate"
                type="date"
                variant="outline"
                value={form.birthDate}
                onChange={(event) =>
                  updateField("birthDate", event.target.value)
                }
              />
            </MemberFormField>
          </MemberFormSection>

          <MemberFormSection title="주소">
            <MemberFormField
              label="우편번호"
              htmlFor="edit-postalCode"
              error={fieldErrors.postalCode}
            >
              <AdminInput
                id="edit-postalCode"
                variant="outline"
                value={form.postalCode}
                onChange={(event) =>
                  updateField("postalCode", event.target.value)
                }
                placeholder="00000"
              />
            </MemberFormField>

            <MemberFormField
              label="주소"
              htmlFor="edit-address"
              error={fieldErrors.address}
            >
              <AdminInput
                id="edit-address"
                variant="outline"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </MemberFormField>

            <MemberFormField
              label="상세주소"
              htmlFor="edit-addressDetail"
              error={fieldErrors.addressDetail}
              className="sm:col-span-2"
            >
              <AdminInput
                id="edit-addressDetail"
                variant="outline"
                value={form.addressDetail}
                onChange={(event) =>
                  updateField("addressDetail", event.target.value)
                }
              />
            </MemberFormField>
          </MemberFormSection>

          <MemberFormSection title="메모">
            <MemberFormField
              label="메모"
              htmlFor="edit-memo"
              error={fieldErrors.memo}
              className="sm:col-span-2"
            >
              <MemberFormTextarea
                id="edit-memo"
                value={form.memo}
                onChange={(event) => updateField("memo", event.target.value)}
                placeholder="관리자 메모"
              />
            </MemberFormField>
          </MemberFormSection>
        </form>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center text-sm text-[#EF4444]">
          {formError ?? "회원 정보를 불러오지 못했습니다."}
        </div>
      )}
    </AdminModal>
  );
}
