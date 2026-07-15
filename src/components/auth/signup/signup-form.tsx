"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  SignupFormField,
  signupInputClassName,
  signupSelectClassName,
} from "@/components/auth/signup/signup-form-field";
import {
  SIGNUP_BIRTH_DAYS,
  SIGNUP_BIRTH_MONTHS,
  SIGNUP_BIRTH_YEARS,
  SIGNUP_EMAIL_DOMAINS,
  SIGNUP_JOIN_PATHS,
  SIGNUP_PHONE_PREFIXES,
} from "@/components/auth/signup/signup-form-data";
import {
  checkLoginIdDuplicateAction,
  createMemberAction,
} from "@/features/members/actions/member-registration.actions";
import type { MemberRegistrationInput } from "@/features/members/types/member-registration.types";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("2001");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [loginId, setLoginId] = useState("");
  const [loginIdMessage, setLoginIdMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [emailLocal, setEmailLocal] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [emailCustomDomain, setEmailCustomDomain] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMiddle, setPhoneMiddle] = useState("");
  const [phoneLast, setPhoneLast] = useState("");
  const [joinPath, setJoinPath] = useState("");
  const [joinPathOther, setJoinPathOther] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loginIdVerified, setLoginIdVerified] = useState(false);
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  async function handleCheckDuplicate() {
    if (!loginId.trim()) {
      setLoginIdMessage("아이디를 입력해주세요.");
      setLoginIdAvailable(false);
      setLoginIdVerified(false);
      return;
    }

    setIsCheckingLoginId(true);
    try {
      const result = await checkLoginIdDuplicateAction(loginId);
      setLoginIdMessage(result.message);
      setLoginIdAvailable(result.available);
      setLoginIdVerified(result.available);
    } catch {
      setLoginIdMessage("중복확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setLoginIdAvailable(false);
      setLoginIdVerified(false);
    } finally {
      setIsCheckingLoginId(false);
    }
  }

  function buildBirthDate() {
    if (!birthYear || !birthMonth || !birthDay) return "";
    return `${birthYear}-${birthMonth}-${birthDay}`;
  }

  function buildEmail() {
    const local = emailLocal.trim();
    const domain = (emailDomain === "custom" ? emailCustomDomain : emailDomain).trim();
    if (!local || !domain) return "";
    return `${local}@${domain}`;
  }

  function buildPhone() {
    const middle = phoneMiddle.trim();
    const last = phoneLast.trim();
    if (!middle || !last) return "";
    return `${phonePrefix}-${middle}-${last}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!loginIdVerified) {
      setToastMessage("아이디 중복확인을 완료해주세요.");
      return;
    }

    if (!termsAgreed || !privacyAgreed) {
      setToastMessage("필수 약관에 동의해주세요.");
      return;
    }

    const input: MemberRegistrationInput = {
      name,
      residentRegistrationNumber: "",
      birthDate: buildBirthDate(),
      calendarType,
      loginId,
      password,
      passwordConfirm,
      email: buildEmail(),
      tel: "",
      phone: buildPhone(),
      postalCode: "",
      address: "",
      addressDetail: "",
      graduatedSchool: "",
      schoolName: "",
      majorName: "",
      desiredDegree: "",
      desiredMajorName: "",
      joinPath: joinPathOther.trim() || joinPath,
      occupation: "",
      degreePurpose: "",
      referrerLoginId: partnerCode,
    };

    setIsSubmitting(true);
    try {
      const result = await createMemberAction(input, loginIdVerified);
      if (!result.success) {
        setToastMessage(result.message);
        if (result.field === "loginId") {
          setLoginIdVerified(false);
          setLoginIdAvailable(false);
        }
        return;
      }

      setToastMessage("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      window.setTimeout(() => router.push("/login"), 1200);
    } catch {
      setToastMessage("회원가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {toastMessage ? (
        <div className="fixed top-6 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg bg-[#333] px-4 py-3 text-center text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}

      <div className="w-full max-w-[640px] rounded-[12px] border border-[#eee] bg-white px-6 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:px-10 sm:py-10">
        <h1 className="text-center text-2xl font-bold text-[#00376e] sm:text-[28px]">회원가입</h1>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <SignupFormField label="이름" htmlFor="name">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="이름"
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField label="생년월일">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <select
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  className={signupSelectClassName}
                  aria-label="출생년도"
                >
                  {SIGNUP_BIRTH_YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={birthMonth}
                  onChange={(event) => setBirthMonth(event.target.value)}
                  className={signupSelectClassName}
                  aria-label="출생월"
                >
                  <option value="">월</option>
                  {SIGNUP_BIRTH_MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={birthDay}
                  onChange={(event) => setBirthDay(event.target.value)}
                  className={signupSelectClassName}
                  aria-label="출생일"
                >
                  <option value="">일</option>
                  {SIGNUP_BIRTH_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    "h-11 min-w-[64px] rounded border px-4 text-sm font-semibold sm:h-12",
                    calendarType === "solar"
                      ? "border-[#00376e] bg-[#00376e] text-white"
                      : "border-[#ddd] bg-white text-[#666]",
                  )}
                  onClick={() => setCalendarType("solar")}
                >
                  양력
                </button>
                <button
                  type="button"
                  className={cn(
                    "h-11 min-w-[64px] rounded border px-4 text-sm font-semibold sm:h-12",
                    calendarType === "lunar"
                      ? "border-[#00376e] bg-[#00376e] text-white"
                      : "border-[#ddd] bg-white text-[#666]",
                  )}
                  onClick={() => setCalendarType("lunar")}
                >
                  음력
                </button>
              </div>
            </div>
          </SignupFormField>

          <SignupFormField
            label="아이디"
            htmlFor="loginId"
            helpText="* 영문이나 숫자, 또는 둘을 조합하여 4~20자 이내로 기재해 주십시오."
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(event) => {
                  setLoginId(event.target.value);
                  setLoginIdMessage(null);
                  setLoginIdVerified(false);
                  setLoginIdAvailable(null);
                }}
                placeholder="아이디"
                className={signupInputClassName}
              />
              <button
                type="button"
                onClick={handleCheckDuplicate}
                disabled={isCheckingLoginId}
                className="h-11 shrink-0 rounded bg-[#555] px-5 text-sm font-semibold text-white transition hover:bg-[#444] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12"
              >
                {isCheckingLoginId ? "확인 중..." : "중복확인"}
              </button>
            </div>
            {loginIdMessage ? (
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  loginIdAvailable === false ? "text-[#d64545]" : "text-[#00376e]",
                )}
              >
                {loginIdMessage}
              </p>
            ) : null}
          </SignupFormField>

          <SignupFormField
            label="비밀번호"
            htmlFor="password"
            helpText="* 영문, 숫자, 특수기호 등 4~20자 (형식 제한 없음)"
          >
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField label="비밀번호 확인" htmlFor="passwordConfirm">
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className={signupInputClassName}
            />
          </SignupFormField>

          <SignupFormField
            label="이메일"
            helpText="* 아이디와 비밀번호 찾기, 수강정보 및 이벤트 당첨 안내 시 필요합니다."
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <input
                type="text"
                value={emailLocal}
                onChange={(event) => setEmailLocal(event.target.value)}
                className={cn(signupInputClassName, "sm:max-w-[180px]")}
                aria-label="이메일 아이디"
              />
              <span className="hidden text-[#666] sm:inline">@</span>
              {emailDomain === "custom" ? (
                <input
                  type="text"
                  value={emailCustomDomain}
                  onChange={(event) => setEmailCustomDomain(event.target.value)}
                  placeholder="직접입력"
                  className={cn(signupInputClassName, "sm:flex-1")}
                  aria-label="이메일 도메인 직접입력"
                />
              ) : (
                <select
                  value={emailDomain}
                  onChange={(event) => setEmailDomain(event.target.value)}
                  className={cn(signupSelectClassName, "sm:flex-1")}
                  aria-label="이메일 도메인"
                >
                  {SIGNUP_EMAIL_DOMAINS.map((domain) => (
                    <option key={domain.value || "empty"} value={domain.value}>
                      {domain.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-3 rounded border border-[#e5e5e5] bg-[#f8f8f8] px-3 py-3 text-xs leading-relaxed text-[#666]">
              한메일/다음 메일은 수강안내 및 공지 메일 발송이 원활하지 않을 수 있습니다.
              가급적 네이버, Gmail 등 다른 메일을 이용해 주시기 바랍니다.
            </div>
          </SignupFormField>

          <SignupFormField
            label="연락처"
            helpText="* 휴대폰번호를 정확히 기재해주세요! (출석, 시험 등 주요 학사일정 문자공지)"
          >
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={phonePrefix}
                onChange={(event) => setPhonePrefix(event.target.value)}
                className={cn(signupSelectClassName, "w-[88px] shrink-0")}
                aria-label="휴대폰 앞자리"
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
                aria-label="휴대폰 중간자리"
              />
              <span className="text-[#999]">-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={phoneLast}
                onChange={(event) => setPhoneLast(event.target.value)}
                className={cn(signupInputClassName, "min-w-[80px] flex-1")}
                aria-label="휴대폰 끝자리"
              />
            </div>
          </SignupFormField>

          <div className="border-t border-[#eee] pt-6">
            <p className="mb-4 text-sm font-bold text-[#222] sm:text-[15px]">추가정보입력</p>

            <SignupFormField label="가입경로">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                {SIGNUP_JOIN_PATHS.map((path) => (
                  <label key={path} className="inline-flex items-center gap-2 text-sm text-[#444]">
                    <input
                      type="radio"
                      name="joinPath"
                      value={path}
                      checked={joinPath === path}
                      onChange={() => setJoinPath(path)}
                      className="size-4 accent-[#00376e]"
                    />
                    {path}
                  </label>
                ))}
              </div>
              <input
                type="text"
                value={joinPathOther}
                onChange={(event) => setJoinPathOther(event.target.value)}
                className={cn(signupInputClassName, "mt-3")}
                placeholder="기타"
              />
            </SignupFormField>

            <SignupFormField
              label="파트너스 코드"
              htmlFor="partnerCode"
              helpText="소개한 파트너스가 있다면, 파트너스 코드를 입력하세요."
              className="mt-6"
            >
              <input
                id="partnerCode"
                type="text"
                value={partnerCode}
                onChange={(event) => setPartnerCode(event.target.value)}
                className={signupInputClassName}
              />
            </SignupFormField>
          </div>

          <div className="space-y-3 border-t border-[#eee] pt-6">
            <label className="flex items-start gap-2 text-sm text-[#444]">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(event) => setTermsAgreed(event.target.checked)}
                className="mt-0.5 size-4 accent-[#00376e]"
              />
              [필수] 이용약관 동의
            </label>
            <label className="flex items-start gap-2 text-sm text-[#444]">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(event) => setPrivacyAgreed(event.target.checked)}
                className="mt-0.5 size-4 accent-[#00376e]"
              />
              [필수] 개인정보 수집 및 이용 동의
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center rounded-md bg-[#00376e] text-base font-semibold text-white transition hover:bg-[#2c74e4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "가입 처리 중..." : "가입하기"}
          </button>
        </form>
      </div>
    </>
  );
}
