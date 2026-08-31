'use client';

import Link from 'next/link';
import { PrivacyBody } from '@/features/korhrd/components/policy/PrivacyBody';
import { TermsBody } from '@/features/korhrd/components/policy/TermsBody';
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
  const [email, setEmail] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  /* 약관 팝업 — 'terms' | 'privacy' | null */
  const [policyOpen, setPolicyOpen] = useState<'terms' | 'privacy' | null>(null);

  const [idCheck, setIdCheck] = useState<{ ok: boolean; text: string } | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAgreed = agree1 && agree2;

  /* 휴대폰 번호 하이픈 자동 삽입 — 숫자만 남기고 010-1234-5678 형태로 */
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const checkId = () => {
    setIdCheck(null);
    startTransition(async () => {
      const result = await checkLoginIdDuplicateAction(loginId);
      setIdCheck({ ok: result.available, text: result.message });
      setVerifiedId(result.available ? loginId.trim() : null);
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (verifiedId !== loginId.trim()) {
      setError('아이디 중복확인을 완료해주세요.');
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
          // 생년월일은 가입 단계에서 받지 않습니다(자격증 신청 때 확인).
          birthDate: '',
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
          partnerCode,
        },
        true,
      );

      if (result.success) {
        // push 뒤 refresh()는 이동이 끝나기 전에 현재 페이지를 다시 불러와
        // 버튼이 "가입 중…"에서 멈춥니다. 자격증 신청에서 실제로 겪은 문제입니다.
        router.push('/signup/complete');
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
                onChange={(event) => setPhone(formatPhone(event.target.value))}
              />
            </div>

            <div className="field">
              <label htmlFor="email">이메일 <span className="hint">(선택)</span></label>
              <input
                id="email" type="email" autoComplete="email" placeholder="수료증·안내 수신용"
                value={email} onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="partner-code">파트너스 코드 <span className="hint">(선택)</span></label>
              <input
                id="partner-code" type="text" placeholder="제휴 코드가 있다면 입력해주세요"
                value={partnerCode} onChange={(event) => setPartnerCode(event.target.value)}
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
                [필수]{' '}
                <button
                  type="button"
                  onClick={() => setPolicyOpen('terms')}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  이용약관
                </button>{' '}
                동의
              </label>
            </div>
            <div className="agree" style={{ background: 'none', padding: '2px 4px' }}>
              <input
                id="agree2" type="checkbox" required checked={agree2}
                onChange={(event) => setAgree2(event.target.checked)}
              />
              <label htmlFor="agree2">
                [필수]{' '}
                <button
                  type="button"
                  onClick={() => setPolicyOpen('privacy')}
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  개인정보 수집·이용
                </button>{' '}
                동의
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

          {/* 이용약관·개인정보 팝업 — 본문은 /terms·/privacy 페이지와 같은 컴포넌트 */}
          {policyOpen ? (
            <div
              role="dialog"
              aria-modal="true"
              onClick={() => setPolicyOpen(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(15,18,25,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
              }}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: '100%', maxWidth: 640, maxHeight: '80vh',
                  background: '#fff', borderRadius: 12,
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E8EB' }}>
                  <strong style={{ fontSize: 16 }}>
                    {policyOpen === 'terms' ? '이용약관' : '개인정보 수집·이용'}
                  </strong>
                  <button
                    type="button" aria-label="닫기" onClick={() => setPolicyOpen(null)}
                    style={{ background: 'none', border: 'none', fontSize: 18, color: '#8B95A1', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ overflowY: 'auto', padding: '4px 20px' }}>
                  {policyOpen === 'terms' ? <TermsBody /> : <PrivacyBody />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid #E5E8EB' }}>
                  <button
                    className="btn btn--ghost" type="button" onClick={() => setPolicyOpen(null)}
                  >
                    닫기
                  </button>
                  <button
                    className="btn btn--primary" type="button"
                    onClick={() => {
                      if (policyOpen === 'terms') setAgree1(true);
                      else setAgree2(true);
                      setPolicyOpen(null);
                    }}
                  >
                    동의합니다
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
