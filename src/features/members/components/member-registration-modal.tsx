"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import {
  checkLoginIdDuplicateAction,
  createMemberAction,
} from "@/features/members/actions/member-registration.actions";
import {
  MemberFormField,
  MemberFormSection,
  MemberFormSelect,
} from "@/features/members/components/member-form-field";
import { CALENDAR_TYPE_LABELS } from "@/features/members/constants";
import type { MemberRegistrationInput } from "@/features/members/types/member-registration.types";
import type { CalendarType } from "@/types/database.types";
import { cn } from "@/lib/utils";

const INITIAL_FORM: MemberRegistrationInput = {
  name: "",
  residentRegistrationNumber: "",
  birthDate: "",
  calendarType: "solar",
  loginId: "",
  password: "",
  passwordConfirm: "",
  email: "",
  tel: "",
  phone: "",
  postalCode: "",
  address: "",
  addressDetail: "",
  graduatedSchool: "",
  schoolName: "",
  majorName: "",
  desiredDegree: "",
  desiredMajorName: "",
  joinPath: "",
  occupation: "",
  degreePurpose: "",
  referrerLoginId: "",
};

type MemberRegistrationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberRegistrationModal({
  open,
  onOpenChange,
}: MemberRegistrationModalProps) {
  const router = useRouter();
  const [form, setForm] = useState<MemberRegistrationInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MemberRegistrationInput, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loginIdVerified, setLoginIdVerified] = useState(false);
  const [loginIdMessage, setLoginIdMessage] = useState<string | null>(null);
  const [isCheckingLoginId, startCheckLoginId] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  function resetForm() {
    setForm(INITIAL_FORM);
    setFieldErrors({});
    setFormError(null);
    setLoginIdVerified(false);
    setLoginIdMessage(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function updateField<K extends keyof MemberRegistrationInput>(
    key: K,
    value: MemberRegistrationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);

    if (key === "loginId") {
      setLoginIdVerified(false);
      setLoginIdMessage(null);
    }
  }

  function handleCheckLoginId() {
    startCheckLoginId(async () => {
      setLoginIdMessage(null);
      setFieldErrors((current) => ({ ...current, loginId: undefined }));

      try {
        const result = await checkLoginIdDuplicateAction(form.loginId);
        setLoginIdVerified(result.available);
        setLoginIdMessage(result.message);

        if (!result.available) {
          setFieldErrors((current) => ({
            ...current,
            loginId: result.message,
          }));
        }
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "아이디 중복확인에 실패했습니다.",
        );
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startSubmit(async () => {
      setFormError(null);
      setFieldErrors({});

      try {
        const result = await createMemberAction(form, loginIdVerified);

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
          error instanceof Error ? error.message : "회원 등록에 실패했습니다.",
        );
      }
    });
  }

  return (
    <AdminModal
      open={open}
      onOpenChange={handleOpenChange}
      title="회원등록"
      description="신규 회원 정보를 입력하고 저장하세요."
      className="flex max-h-[90vh] flex-col sm:max-w-4xl"
      footer={
        <>
          <AdminButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </AdminButton>
          <AdminButton type="submit" form="member-registration-form" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </AdminButton>
        </>
      }
    >
      <form
        id="member-registration-form"
        className="max-h-[min(60vh,640px)] space-y-6 overflow-y-auto pr-1"
        onSubmit={handleSubmit}
      >
        {formError ? (
          <p className="rounded-lg bg-[#FEF2F2] px-4 py-3 text-sm text-[#EF4444]">
            {formError}
          </p>
        ) : null}

        <MemberFormSection title="기본 정보">
          <MemberFormField label="이름" htmlFor="name" required error={fieldErrors.name}>
            <AdminInput
              id="name"
              variant="outline"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="이름"
            />
          </MemberFormField>

          <MemberFormField
            label="주민번호"
            htmlFor="residentRegistrationNumber"
            error={fieldErrors.residentRegistrationNumber}
          >
            <AdminInput
              id="residentRegistrationNumber"
              variant="outline"
              value={form.residentRegistrationNumber}
              onChange={(event) =>
                updateField("residentRegistrationNumber", event.target.value)
              }
              placeholder="000000-0000000"
            />
          </MemberFormField>

          <MemberFormField
            label="생년월일"
            htmlFor="birthDate"
            error={fieldErrors.birthDate}
          >
            <AdminInput
              id="birthDate"
              type="date"
              variant="outline"
              value={form.birthDate}
              onChange={(event) => updateField("birthDate", event.target.value)}
            />
          </MemberFormField>

          <MemberFormField label="양력/음력" htmlFor="calendarType">
            <MemberFormSelect
              id="calendarType"
              value={form.calendarType}
              onChange={(event) =>
                updateField("calendarType", event.target.value as CalendarType)
              }
            >
              {Object.entries(CALENDAR_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </MemberFormSelect>
          </MemberFormField>
        </MemberFormSection>

        <MemberFormSection title="계정 정보">
          <MemberFormField
            label="아이디"
            htmlFor="loginId"
            required
            error={fieldErrors.loginId}
            className="sm:col-span-2"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <AdminInput
                id="loginId"
                variant="outline"
                value={form.loginId}
                onChange={(event) => updateField("loginId", event.target.value)}
                placeholder="4~20자 영문, 숫자, 밑줄"
                className="flex-1"
              />
              <AdminButton
                type="button"
                variant="outline"
                onClick={handleCheckLoginId}
                disabled={isCheckingLoginId || !form.loginId.trim()}
              >
                {isCheckingLoginId ? "확인 중..." : "중복확인"}
              </AdminButton>
            </div>
            {loginIdMessage ? (
              <p
                className={cn(
                  "text-xs",
                  loginIdVerified ? "text-[#059669]" : "text-[#EF4444]",
                )}
              >
                {loginIdMessage}
              </p>
            ) : null}
          </MemberFormField>

          <MemberFormField
            label="비밀번호"
            htmlFor="password"
            required
            error={fieldErrors.password}
          >
            <AdminInput
              id="password"
              type="password"
              variant="outline"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="4~20자"
            />
          </MemberFormField>

          <MemberFormField
            label="비밀번호 확인"
            htmlFor="passwordConfirm"
            required
            error={fieldErrors.passwordConfirm}
          >
            <AdminInput
              id="passwordConfirm"
              type="password"
              variant="outline"
              value={form.passwordConfirm}
              onChange={(event) =>
                updateField("passwordConfirm", event.target.value)
              }
              placeholder="비밀번호 재입력"
            />
          </MemberFormField>
        </MemberFormSection>

        <MemberFormSection title="연락처">
          <MemberFormField label="이메일" htmlFor="email" error={fieldErrors.email}>
            <AdminInput
              id="email"
              type="email"
              variant="outline"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="example@email.com"
            />
          </MemberFormField>

          <MemberFormField label="전화번호" htmlFor="tel" error={fieldErrors.tel}>
            <AdminInput
              id="tel"
              variant="outline"
              value={form.tel}
              onChange={(event) => updateField("tel", event.target.value)}
              placeholder="02-0000-0000"
            />
          </MemberFormField>

          <MemberFormField
            label="휴대폰번호"
            htmlFor="phone"
            error={fieldErrors.phone}
            className="sm:col-span-2"
          >
            <AdminInput
              id="phone"
              variant="outline"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="010-0000-0000"
            />
          </MemberFormField>
        </MemberFormSection>

        <MemberFormSection title="주소">
          <MemberFormField
            label="우편번호"
            htmlFor="postalCode"
            error={fieldErrors.postalCode}
          >
            <AdminInput
              id="postalCode"
              variant="outline"
              value={form.postalCode}
              onChange={(event) => updateField("postalCode", event.target.value)}
              placeholder="00000"
            />
          </MemberFormField>

          <MemberFormField label="주소" htmlFor="address" error={fieldErrors.address}>
            <AdminInput
              id="address"
              variant="outline"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="주소"
            />
          </MemberFormField>

          <MemberFormField
            label="상세주소"
            htmlFor="addressDetail"
            error={fieldErrors.addressDetail}
            className="sm:col-span-2"
          >
            <AdminInput
              id="addressDetail"
              variant="outline"
              value={form.addressDetail}
              onChange={(event) => updateField("addressDetail", event.target.value)}
              placeholder="상세주소"
            />
          </MemberFormField>
        </MemberFormSection>

        <MemberFormSection title="학력 정보">
          <MemberFormField
            label="출신학교"
            htmlFor="graduatedSchool"
            error={fieldErrors.graduatedSchool}
          >
            <AdminInput
              id="graduatedSchool"
              variant="outline"
              value={form.graduatedSchool}
              onChange={(event) =>
                updateField("graduatedSchool", event.target.value)
              }
            />
          </MemberFormField>

          <MemberFormField
            label="학교명"
            htmlFor="schoolName"
            error={fieldErrors.schoolName}
          >
            <AdminInput
              id="schoolName"
              variant="outline"
              value={form.schoolName}
              onChange={(event) => updateField("schoolName", event.target.value)}
            />
          </MemberFormField>

          <MemberFormField
            label="전공명"
            htmlFor="majorName"
            error={fieldErrors.majorName}
          >
            <AdminInput
              id="majorName"
              variant="outline"
              value={form.majorName}
              onChange={(event) => updateField("majorName", event.target.value)}
            />
          </MemberFormField>

          <MemberFormField
            label="희망학위"
            htmlFor="desiredDegree"
            error={fieldErrors.desiredDegree}
          >
            <AdminInput
              id="desiredDegree"
              variant="outline"
              value={form.desiredDegree}
              onChange={(event) =>
                updateField("desiredDegree", event.target.value)
              }
            />
          </MemberFormField>

          <MemberFormField
            label="희망 전공명"
            htmlFor="desiredMajorName"
            error={fieldErrors.desiredMajorName}
            className="sm:col-span-2"
          >
            <AdminInput
              id="desiredMajorName"
              variant="outline"
              value={form.desiredMajorName}
              onChange={(event) =>
                updateField("desiredMajorName", event.target.value)
              }
            />
          </MemberFormField>
        </MemberFormSection>

        <MemberFormSection title="기타 정보">
          <MemberFormField
            label="가입경로"
            htmlFor="joinPath"
            error={fieldErrors.joinPath}
          >
            <AdminInput
              id="joinPath"
              variant="outline"
              value={form.joinPath}
              onChange={(event) => updateField("joinPath", event.target.value)}
            />
          </MemberFormField>

          <MemberFormField
            label="직업"
            htmlFor="occupation"
            error={fieldErrors.occupation}
          >
            <AdminInput
              id="occupation"
              variant="outline"
              value={form.occupation}
              onChange={(event) => updateField("occupation", event.target.value)}
            />
          </MemberFormField>

          <MemberFormField
            label="학위취득목적"
            htmlFor="degreePurpose"
            error={fieldErrors.degreePurpose}
          >
            <AdminInput
              id="degreePurpose"
              variant="outline"
              value={form.degreePurpose}
              onChange={(event) =>
                updateField("degreePurpose", event.target.value)
              }
            />
          </MemberFormField>

          <MemberFormField
            label="추천인 ID"
            htmlFor="referrerLoginId"
            error={fieldErrors.referrerLoginId}
          >
            <AdminInput
              id="referrerLoginId"
              variant="outline"
              value={form.referrerLoginId}
              onChange={(event) =>
                updateField("referrerLoginId", event.target.value)
              }
              placeholder="추천인 아이디"
            />
          </MemberFormField>
        </MemberFormSection>
      </form>
    </AdminModal>
  );
}
