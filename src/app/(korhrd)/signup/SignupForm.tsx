'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  checkLoginIdDuplicateAction,
  createMemberAction,
} from '@/features/members/actions/member-registration.actions';

/**
 * 회원가입 — 마크업은 korhrd 디자인(join.html), 저장은 기존 회원 등록 서비스.
 *
 * 전달본 양식(아이디·비밀번호·이름·휴대폰·생년월일·이메일)을 그대로 씁니다.
 * 서비스가 필수로 보는 것도 이름·아이디·비밀번호뿐이고, 주소·학력 등 어드민
 * 전용 항목은 선택이라 가입 단계에서는 받지 않습니다(어드민에서 보완 가능).
 */
export function SignupForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [email, setEmail] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const [idCheck, setIdCheck] = useState<{ ok: boolean; text: string } | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAgreed = agree1 && agree2;

  const checkId = () => {
    setIdCheck(null);
    startTransition(async () => {
      const result = await checkLoginIdDuplicateAction(loginId);
      setIdCheck({ ok: result.available, text: result.message });
      setVerifiedId(result.available ? loginId.trim() : null);
    });
  };

  /** 생년월일 8자리(19750320) → 저장 형식(1975-03-20) */
  const toBirthDate = (value: string) => {
    const d = value.replace(/\D/g, '');
    return d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : '';
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (verifiedId !== loginId.trim()) {
      setError('아이디 중복확인을 완료해주세요.');
      return;
    }
    if (birth && !toBirthDate(birth)) {
      setError('생년월일은 8자리 숫자로 입력해주세요. (예: 19750320)');
      return;
    }

    startTransition(async () => {
      const result = await createMemberAction(
        {
          name,
          loginId,
          password,
          passwordConfirm,
          email,
          phone,
          birthDate: toBirthDate(birth),
          // 아래는 가입 단계에서 받지 않는 어드민 전용 항목입니다.
          residentRegistrationNumber: '',
          calendarType: 'solar',
          tel: '',
          postalCode: '',
          address: '',
          addressDetail: '',
          graduatedSchool: '',
          schoolName: '',
          majorName: '',
          desiredDegree: '',
          desiredMajorName: '',
          joinPath: '홈페이지',
          occupation: '',
          degreePurpose: '',
          referrerLoginId: '',
        },
        true,
      );

      if (result.success) {
        router.push('/signup/complete');
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="page-head text-center"><h1>회원가입</h1></div>

        <div className="form-card">
          <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="userid">
                아이디 <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">(필수)</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="userid" type="text" required autoComplete="username"
                  placeholder="영문·숫자·밑줄 4~20자" value={loginId}
                  onChange={(event) => {
                    setLoginId(event.target.value);
                    setIdCheck(null);
                    setVerifiedId(null);
                  }}
                />
                <button
                  className="btn btn--ghost" type="button" onClick={checkId}
                  disabled={isPending || !loginId.trim()}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  중복확인
                </button>
              </div>
              {idCheck ? (
                <p className={`my-card__status my-card__status--${idCheck.ok ? 'pass' : 'fail'}`}>
                  {idCheck.text}
                </p>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="userpw">
                비밀번호 <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">(필수)</span>
              </label>
              <input
                id="userpw" type="password" required autoComplete="new-password"
                placeholder="4~20자" value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="userpw2">
                비밀번호 확인 <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">(필수)</span>
              </label>
              <input
                id="userpw2" type="password" required autoComplete="new-password"
                placeholder="비밀번호를 다시 입력하세요" value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="name">
                이름 <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">(필수)</span>
              </label>
              <input
                id="name" type="text" required autoComplete="name" placeholder="홍길동"
                value={name} onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="phone">
                휴대폰 번호 <span className="req" aria-hidden="true">*</span>
                <span className="sr-only">(필수)</span>
              </label>
              <input
                id="phone" type="tel" required autoComplete="tel" inputMode="numeric"
                placeholder="010-1234-5678" value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="birth">
                생년월일 <span className="hint">— 자격증에 표기됩니다</span>
              </label>
              <input
                id="birth" type="text" inputMode="numeric" maxLength={8}
                placeholder="예) 19750320" value={birth}
                onChange={(event) => setBirth(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="email">이메일 <span className="hint">(선택)</span></label>
              <input
                id="email" type="email" autoComplete="email" placeholder="수료증·안내 수신용"
                value={email} onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="agree">
              <input
                id="agree-all" type="checkbox" checked={allAgreed}
                onChange={(event) => {
                  setAgree1(event.target.checked);
                  setAgree2(event.target.checked);
                }}
              />
              <label htmlFor="agree-all">
                <b>전체 동의</b> — 이용약관, 개인정보 수집·이용에 모두 동의합니다.
              </label>
            </div>
            <div className="agree" style={{ background: 'none', padding: '2px 4px' }}>
              <input
                id="agree1" type="checkbox" required checked={agree1}
                onChange={(event) => setAgree1(event.target.checked)}
              />
              <label htmlFor="agree1">
                [필수] <Link href="/terms" style={{ textDecoration: 'underline' }}>이용약관</Link> 동의
              </label>
            </div>
            <div className="agree" style={{ background: 'none', padding: '2px 4px' }}>
              <input
                id="agree2" type="checkbox" required checked={agree2}
                onChange={(event) => setAgree2(event.target.checked)}
              />
              <label htmlFor="agree2">
                [필수] <Link href="/privacy" style={{ textDecoration: 'underline' }}>개인정보 수집·이용</Link> 동의
              </label>
            </div>

            {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}

            <button
              className="btn btn--primary btn--lg btn--block" type="submit"
              disabled={isPending || !allAgreed}
            >
              {isPending ? '가입 중…' : '가입하고 무료수강 시작하기'}
            </button>
          </form>

          <p className="auth-links">
            이미 회원이신가요? <Link href="/login">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
