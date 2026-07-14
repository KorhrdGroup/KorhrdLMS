"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Camera, CheckCircle2, Info } from "lucide-react";

import {
  SignupFormField,
  signupInputClassName,
  signupSelectClassName,
} from "@/components/auth/signup/signup-form-field";
import { SIGNUP_PHONE_PREFIXES } from "@/components/auth/signup/signup-form-data";
import { figmaClass } from "@/components/home/home-design";
import { submitCertificateApplicationAction } from "@/features/certificate-applications/actions/certificate-application.actions";
import { CERTIFICATE_PAYMENT_METHOD_OPTIONS } from "@/features/certificate-applications/constants";
import {
  uploadCertificatePhotoFile,
  validateCertificatePhotoFile,
} from "@/features/certificate-applications/lib/certificate-photo-upload.client";
import type {
  ApplicantProfile,
  EligibleCertificateCourse,
} from "@/features/certificate-applications/types/certificate-application.types";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database.types";

const GUIDE_NOTES = [
  "배송기간: 협회 명단 전달 후 약 1~2일 소요됩니다.",
  "발급금액: 100,000원 (자격증 발급비용·배송비 포함)",
  "바우처 지원기관 등록, 강사 자격요건 등록 등의 용도로도 사용 가능합니다.",
  "자격증 발급은 정식자격등록번호를 부여하여 발급됩니다.",
] as const;

const CAUTION_NOTES = [
  "배송지 주소와 연락처를 반드시 확인해주세요.",
  "배송정보 오류로 반송될 경우, 재발송 비용은 신청자 본인 부담입니다.",
  "무통장입금 시 반드시 신청자 본인 명의로 입금해주세요. 입금자명이 다를 경우 확인 연락을 드릴 수 있습니다.",
  "무통장입금 시 입금자명 옆에 생년월일을 함께 기재해주세요. (예: 홍길동0101)",
] as const;

function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

function formatBirthDate(birthDate: string | null) {
  if (!birthDate) return "미등록";
  return birthDate;
}

/** "010-1234-5678" 형태의 저장된 연락처를 3분할 입력 상태로 분리합니다. */
function splitPhone(phone: string | null): [string, string, string] {
  if (!phone) return ["010", "", ""];
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 9) return ["010", "", ""];
  const prefix = digits.slice(0, 3);
  const rest = digits.slice(3);
  const middle = rest.slice(0, rest.length - 4);
  const last = rest.slice(-4);
  return [prefix, middle, last];
}

type CertificateApplyFormProps = {
  profile: ApplicantProfile;
  eligibleCourses: EligibleCertificateCourse[];
  issuanceCost: number;
};

export function CertificateApplyForm({
  profile,
  eligibleCourses,
  issuanceCost,
}: CertificateApplyFormProps) {
  const router = useRouter();
  const firstSelectable = eligibleCourses.find((course) => !course.alreadyApplied);
  const hasSelectableCourse = Boolean(firstSelectable);
  const [initialPrefix, initialMiddle, initialLast] = splitPhone(profile.phone);

  const [courseId, setCourseId] = useState(firstSelectable?.courseId ?? "");
  const [sameAsMemberInfo, setSameAsMemberInfo] = useState(true);
  const [deliveryName, setDeliveryName] = useState(profile.name);
  const [phonePrefix, setPhonePrefix] = useState(initialPrefix);
  const [phoneMiddle, setPhoneMiddle] = useState(initialMiddle);
  const [phoneLast, setPhoneLast] = useState(initialLast);
  const [postalCode, setPostalCode] = useState(profile.postalCode ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [addressDetail, setAddressDetail] = useState(profile.addressDetail ?? "");
  const [memo, setMemo] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successApplicationId, setSuccessApplicationId] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const selectedCourse = eligibleCourses.find((course) => course.courseId === courseId) ?? null;
  const prepaymentAmount = selectedCourse?.prepaymentAmount ?? 0;
  const finalAmount = Math.max(0, issuanceCost - prepaymentAmount);

  function handleSameAsMemberToggle(checked: boolean) {
    setSameAsMemberInfo(checked);
    if (checked) {
      const [prefix, middle, last] = splitPhone(profile.phone);
      setDeliveryName(profile.name);
      setPhonePrefix(prefix);
      setPhoneMiddle(middle);
      setPhoneLast(last);
      setPostalCode(profile.postalCode ?? "");
      setAddress(profile.address ?? "");
      setAddressDetail(profile.addressDetail ?? "");
    }
  }

  function handlePostalCodeSearch() {
    window.alert("우편번호 검색 서비스는 준비 중입니다. 우편번호와 주소를 직접 입력해주세요.");
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validationError = validateCertificatePhotoFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsUploadingPhoto(true);

    uploadCertificatePhotoFile(file)
      .then((url) => {
        setPhotoUrl(url);
        setPhotoFileName(file.name);
      })
      .catch((uploadError: unknown) => {
        setErrorMessage(
          uploadError instanceof Error ? uploadError.message : "사진 업로드에 실패했습니다.",
        );
      })
      .finally(() => {
        setIsUploadingPhoto(false);
      });
  }

  function handlePhotoRemove() {
    setPhotoUrl("");
    setPhotoFileName("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!courseId) {
      setErrorMessage("자격증을 신청할 과정을 선택해주세요.");
      return;
    }

    const phone = [phonePrefix, phoneMiddle, phoneLast].filter(Boolean).join("-");

    startSubmit(async () => {
      const result = await submitCertificateApplicationAction({
        courseId,
        deliveryName,
        phone,
        postalCode,
        address,
        addressDetail,
        memo,
        photoUrl,
        paymentMethod,
      });

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      setSuccessApplicationId(result.applicationId);
      setSuccessMessage(result.message);
    });
  }

  if (successApplicationId) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 border px-6 py-20 text-center",
          figmaClass.roundedCard,
          figmaClass.borderDefault,
          figmaClass.whiteBg,
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-[#e5f6ec]">
          <CheckCircle2 className="size-7 text-[#0f9d58]" />
        </div>
        <p className={cn("text-[18px] font-bold", figmaClass.textPrimary)}>
          {successMessage ?? "자격증 발급 신청이 접수되었습니다."}
        </p>
        <p className={cn("text-[13px]", figmaClass.textPlaceholder)}>
          입금 확인 및 배송 준비 상태는 자격증발급신청 조회에서 확인하실 수 있습니다.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/certificate/history"
            className="rounded-lg px-5 py-2.5 text-[14px] font-semibold text-white transition hover:brightness-110"
            style={{ backgroundColor: "#00376e" }}
          >
            신청내역 조회로 이동
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccessApplicationId(null);
              setSuccessMessage(null);
              router.refresh();
            }}
            className={cn(
              "rounded-lg border px-5 py-2.5 text-[14px] font-semibold transition hover:bg-[#f4f8ff]",
              figmaClass.textSub,
              figmaClass.borderDefault,
            )}
          >
            다른 자격증 신청하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className={cn("text-[22px] font-bold", figmaClass.textPrimary)}>자격증발급신청</h2>

      <section className={cn("overflow-hidden", figmaClass.roundedCard)}>
        <div className="px-6 py-6 sm:px-8 sm:py-7" style={{ backgroundColor: "#00376e" }}>
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
            상장형 · 카드형 동시 발급
          </span>
          <h3 className="mt-3 text-[20px] font-bold text-white sm:text-[22px]">자격증 발급 구성 안내</h3>
          <p className="mt-1 text-[13px] text-white/70">
            국가 지정기관에 정식등록된 민간자격증을 상장형과 카드형으로 함께 제작해드립니다.
          </p>
        </div>
        <div className={cn("space-y-2.5 border-x border-b p-5", figmaClass.borderDefault, figmaClass.whiteBg)}>
          <p className={cn("text-[13px] font-bold", figmaClass.textPrimary)}>필독사항</p>
          <ul className="space-y-1.5">
            {GUIDE_NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2 text-[13px]">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#00376e]" />
                <span className={figmaClass.textSub}>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className="rounded-lg bg-[#fdeeee] px-4 py-3 text-[13px] text-[#e5433f]">{errorMessage}</p>
        ) : null}

        <section
          className={cn("space-y-4 border p-5", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
        >
          <div className="flex items-start gap-2 rounded-lg bg-[#eef5ff] px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#00376e]" />
            <p className="text-[13px] text-[#00376e]">
              원하시는 과정의 자격증을 선택해주시기 바랍니다. 2개 이상 신청하실 경우 각각 신청해주셔야 합니다.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-left text-[13px]">
              <thead>
                <tr className={cn("border-b", figmaClass.borderDefault)}>
                  <th className={cn("py-2 pr-3 font-semibold", figmaClass.textSub)}>자격증선택</th>
                  <th className={cn("py-2 px-3 font-semibold", figmaClass.textSub)}>성명</th>
                  <th className={cn("py-2 px-3 font-semibold", figmaClass.textSub)}>생년월일</th>
                  <th className={cn("py-2 pl-3 font-semibold", figmaClass.textSub)}>사진첨부</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 pr-3 align-top">
                    <select
                      id="courseId"
                      value={courseId}
                      onChange={(event) => setCourseId(event.target.value)}
                      disabled={!hasSelectableCourse}
                      className={cn(
                        signupSelectClassName,
                        "min-w-[220px]",
                        !hasSelectableCourse && "cursor-not-allowed bg-[#f5f5f5] text-[#999]",
                      )}
                    >
                      {eligibleCourses.length === 0 ? (
                        <option value="" disabled>
                          신청 가능한 자격증이 없습니다.
                        </option>
                      ) : (
                        <>
                          <option value="" disabled>
                            자격증 선택
                          </option>
                          {eligibleCourses.map((course) => (
                            <option
                              key={course.courseId}
                              value={course.courseId}
                              disabled={course.alreadyApplied}
                            >
                              {course.courseTitle} 자격증{course.alreadyApplied ? " (신청완료)" : ""}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <p className="mt-1 text-[11px] text-[#999]">
                      수강 진도율과 시험 기준을 충족한 과정만 선택할 수 있습니다.
                    </p>
                  </td>
                  <td className={cn("py-3 px-3 align-top font-medium", figmaClass.textPrimary)}>{profile.name}</td>
                  <td className={cn("py-3 px-3 align-top", figmaClass.textSub)}>
                    {formatBirthDate(profile.birthDate)}
                  </td>
                  <td className="py-3 pl-3 align-top">
                    <div className="flex items-center gap-2">
                      <div className="flex h-11 w-9 items-center justify-center overflow-hidden rounded-md border border-[#ddd] bg-[#f8f8f8]">
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoUrl} alt="증명사진 미리보기" className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="size-4 text-[#bbb]" />
                        )}
                      </div>
                      <label
                        htmlFor="photoUpload"
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-[#ddd] bg-white px-3 text-xs font-semibold text-[#333] hover:bg-[#f4f8ff]",
                          isUploadingPhoto && "pointer-events-none opacity-60",
                        )}
                      >
                        {isUploadingPhoto ? "업로드 중..." : "사진첨부"}
                      </label>
                      <input
                        id="photoUpload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        className="hidden"
                        disabled={isUploadingPhoto}
                        onChange={handlePhotoChange}
                      />
                      {photoUrl ? (
                        <button
                          type="button"
                          onClick={handlePhotoRemove}
                          className="text-xs font-medium text-[#999] underline hover:text-[#666]"
                        >
                          제거
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[#999]">
                      {photoFileName || "사진첨부는 선택사항입니다. (JPG/PNG, 2MB 이하)"}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-lg bg-[#f5f8ff] px-4 py-4 text-center">
            <p className={cn("text-[13px]", figmaClass.textSub)}>
              발급비용: <span className="font-bold">{formatWon(issuanceCost)}</span> (자격증 발급비용·배송비 포함)
            </p>
            {prepaymentAmount > 0 ? (
              <p className="mt-1 text-[13px] text-[#1257ee]">
                선납금액: <span className="font-bold">-{formatWon(prepaymentAmount)}</span> (선납결제 자동 반영)
              </p>
            ) : null}
            <p className="mt-1 text-[16px] font-bold text-[#1257ee]">
              최종 결제금액 {formatWon(finalAmount)}
            </p>
          </div>
        </section>

        <section
          className={cn("space-y-4 border p-5", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
        >
          <div className="flex items-center justify-between">
            <h3 className={cn("text-[15px] font-bold", figmaClass.textPrimary)}>배송정보</h3>
            <label className="inline-flex items-center gap-2 text-[13px] text-[#666]">
              <input
                type="checkbox"
                checked={sameAsMemberInfo}
                onChange={(event) => handleSameAsMemberToggle(event.target.checked)}
                className="size-4 rounded border-[#ccc] accent-[#00376e]"
              />
              내 정보와 동일
            </label>
          </div>

          <SignupFormField label="이름" htmlFor="deliveryName">
            <input
              id="deliveryName"
              type="text"
              value={deliveryName}
              onChange={(event) => setDeliveryName(event.target.value)}
              placeholder="받으시는 분 이름"
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField label="우편번호">
            <div className="flex gap-2">
              <input
                type="text"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder="우편번호"
                className={cn(signupInputClassName, "max-w-[160px]")}
              />
              <button
                type="button"
                onClick={handlePostalCodeSearch}
                className="h-11 shrink-0 rounded bg-[#555] px-4 text-sm font-semibold text-white transition hover:bg-[#444] sm:h-12"
              >
                우편번호 검색
              </button>
            </div>
          </SignupFormField>

          <SignupFormField label="주소" htmlFor="address">
            <input
              id="address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="주소"
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField label="상세주소" htmlFor="addressDetail">
            <input
              id="addressDetail"
              type="text"
              value={addressDetail}
              onChange={(event) => setAddressDetail(event.target.value)}
              placeholder="상세주소"
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField label="연락처">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={phonePrefix}
                onChange={(event) => setPhonePrefix(event.target.value)}
                className={cn(signupSelectClassName, "w-[88px] shrink-0")}
                aria-label="연락처 앞자리"
              >
                {SIGNUP_PHONE_PREFIXES.map((prefix) => (
                  <option key={prefix} value={prefix}>
                    {prefix}
                  </option>
                ))}
              </select>
              <span className="text-[#999]">-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={phoneMiddle}
                onChange={(event) => setPhoneMiddle(event.target.value)}
                className={cn(signupInputClassName, "min-w-[80px] flex-1")}
                aria-label="연락처 중간자리"
              />
              <span className="text-[#999]">-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={phoneLast}
                onChange={(event) => setPhoneLast(event.target.value)}
                className={cn(signupInputClassName, "min-w-[80px] flex-1")}
                aria-label="연락처 끝자리"
              />
            </div>
          </SignupFormField>

          <SignupFormField label="메모" htmlFor="memo">
            <textarea
              id="memo"
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="배송 시 참고할 내용을 입력해주세요. (선택)"
              rows={3}
              className="w-full rounded border border-[#ddd] bg-white px-3 py-2.5 text-sm text-[#222] outline-none placeholder:text-[#999] focus:border-[#00376e]"
            />
          </SignupFormField>
        </section>

        <section
          className={cn("space-y-3 border p-5", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
        >
          <h3 className={cn("text-[15px] font-bold", figmaClass.textPrimary)}>결제정보</h3>
          <dl className="grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-2">
            <div className="flex items-center justify-between border-b border-dashed border-[#e5e5e5] py-2 sm:border-none sm:py-0">
              <dt className={figmaClass.textPlaceholder}>상품명</dt>
              <dd className={cn("font-semibold", figmaClass.textPrimary)}>자격증 발급신청</dd>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-[#e5e5e5] py-2 sm:border-none sm:py-0">
              <dt className={figmaClass.textPlaceholder}>신청자</dt>
              <dd className={cn("font-semibold", figmaClass.textPrimary)}>{profile.name}</dd>
            </div>
            {prepaymentAmount > 0 ? (
              <div className="flex items-center justify-between border-b border-dashed border-[#e5e5e5] py-2 sm:border-none sm:py-0">
                <dt className={figmaClass.textPlaceholder}>선납금액</dt>
                <dd className="font-semibold text-[#1257ee]">-{formatWon(prepaymentAmount)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between py-2 sm:py-0">
              <dt className={figmaClass.textPlaceholder}>최종결제금액</dt>
              <dd className="text-[16px] font-bold text-[#1257ee]">{formatWon(finalAmount)}</dd>
            </div>
          </dl>

          <div className="pt-2">
            <p className="mb-2 text-[13px] font-semibold text-[#333]">결제방법</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CERTIFICATE_PAYMENT_METHOD_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-[13px] font-semibold",
                    paymentMethod === option.value
                      ? "border-[#00376e] bg-[#f4f8ff] text-[#00376e]"
                      : cn(figmaClass.borderDefault, figmaClass.textSub),
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {finalAmount <= 0 ? (
              <p className="mt-2 text-[12px] text-[#1257ee]">
                * 선납결제로 발급비용이 모두 충당되어 별도 결제 없이 신청이 접수됩니다.
              </p>
            ) : (
              <p className="mt-2 text-[12px] text-[#e5433f]">
                * 결제대행사(PG) 연동은 준비 중입니다. 신청 접수 후 무통장입금 등 방식으로 입금
                확인이 되면 1~2영업일 이내 자격증 발급 절차가 진행됩니다.
              </p>
            )}
          </div>
        </section>

        <section
          className={cn("space-y-2 border p-5", figmaClass.roundedCard, figmaClass.borderDefault, figmaClass.whiteBg)}
        >
          <h3 className={cn("text-[14px] font-bold", figmaClass.textPrimary)}>주의사항</h3>
          <ul className="space-y-1.5">
            {CAUTION_NOTES.map((note) => (
              <li key={note} className={cn("text-[12.5px] leading-relaxed", figmaClass.textPlaceholder)}>
                · {note}
              </li>
            ))}
          </ul>
        </section>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingPhoto || !hasSelectableCourse}
          className="flex h-13 w-full items-center justify-center rounded-lg text-[15px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundColor: "#1257ee", height: 52 }}
        >
          {isSubmitting
            ? "신청 처리 중..."
            : isUploadingPhoto
              ? "사진 업로드 중..."
              : hasSelectableCourse
                ? "신청하기"
                : "신청 가능한 자격증이 없습니다"}
        </button>
      </form>
    </div>
  );
}
