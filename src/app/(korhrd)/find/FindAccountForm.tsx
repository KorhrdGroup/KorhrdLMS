'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import {
  completeFindIdAction,
  requestFindIdCodeAction,
  requestPasswordResetCodeAction,
  resetPasswordAction,
  verifyFindIdCodeAction,
  verifyPasswordResetCodeAction,
} from '@/features/korhrd/actions/find-account.actions';

type Tab = 'id' | 'pw';
/** 입력 → 문자 인증번호 확인 → (아이디 결과 | 새 비밀번호 설정) */
type Step = 'form' | 'code' | 'result';

/** 인증번호 유효시간(초). 서버(phone-verification.service)의 3분과 맞춥니다. */
const CODE_SECONDS = 180;

/**
 * 아이디·비밀번호 찾기 — 휴대폰 문자 인증(네이버 SENS)으로 본인 확인.
 *
 * 인증을 통과해야 아이디 전체가 보이고, 비밀번호도 그 자리에서 바꿀 수 있습니다.
 * 계정 유무를 그대로 노출하지 않도록 실패 문구는 항상 동일합니다.
 */
export function FindAccountForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('id');
  const [step, setStep] = useState<Step>('form');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [foundId, setFoundId] = useState<{ loginId: string; joinedAt: string; socialProvider?: string | null } | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 인증번호 유효시간 카운트다운. 0이 되면 재발송만 가능합니다.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const reset = () => {
    setStep('form');
    setCode('');
    setToken('');
    setPassword('');
    setPasswordConfirm('');
    setFoundId(null);
    setMessage(null);
    setSecondsLeft(0);
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    reset();
  };

  /** 1단계 — 회원 확인 후 인증번호 발송 */
  const requestCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result =
        tab === 'id'
          ? await requestFindIdCodeAction({ name, phone })
          : await requestPasswordResetCodeAction({ loginId, name, phone });

      setMessage({ ok: result.success, text: result.message });
      if (result.success) {
        setStep('code');
        setSecondsLeft(CODE_SECONDS);
      }
    });
  };

  /** 2단계 — 인증번호 확인. 아이디 찾기는 곧바로 결과까지 이어집니다. */
  const submitCode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const verified =
        tab === 'id'
          ? await verifyFindIdCodeAction({ phone, code })
          : await verifyPasswordResetCodeAction({ phone, code });

      if (!verified.success) {
        setMessage({ ok: false, text: verified.message });
        return;
      }

      setSecondsLeft(0);

      if (tab === 'pw') {
        setToken(verified.token);
        setStep('result');
        setMessage({ ok: true, text: '본인 확인이 완료되었습니다. 새 비밀번호를 설정해주세요.' });
        return;
      }

      const found = await completeFindIdAction({ token: verified.token, name });
      if (found.success) {
        setFoundId({ loginId: found.loginId, joinedAt: found.joinedAt, socialProvider: found.socialProvider });
        setStep('result');
      } else {
        setMessage({ ok: false, text: found.message });
      }
    });
  };

  /** 3단계(비밀번호) — 새 비밀번호 저장 */
  const submitPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await resetPasswordAction({
        token,
        loginId,
        name,
        password,
        passwordConfirm,
      });
      if (result.success) {
        // 바뀐 비밀번호로 바로 로그인하도록 넘깁니다.
        // 성공 안내는 로그인 화면 상단(login-notice)에서 이어집니다.
        router.push('/login?reset=1');
        return;
      }
      setMessage({ ok: false, text: result.message });
    });
  };

  const statusLine = message ? (
    <p className={`my-card__status my-card__status--${message.ok ? 'pass' : 'fail'}`}>
      {message.text}
    </p>
  ) : null;

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="page-head text-center"><h1>아이디 · 비밀번호 찾기</h1></div>

        {/* 시안대로 가운데 정렬 — .pill-row 기본값은 왼쪽 정렬입니다.
            아래 여백도 원본 find.html 의 인라인 값(margin-bottom:18px)입니다.
            빠져 있어서 아래 입력 박스와 붙어 보였습니다. */}
        <div
          className="pill-row" role="tablist" aria-label="찾기 유형"
          style={{ justifyContent: 'center', marginBottom: 18 }}
        >
          <button
            className="pill" type="button" role="tab"
            aria-selected={tab === 'id'} onClick={() => switchTab('id')}
          >
            아이디 찾기
          </button>
          <button
            className="pill" type="button" role="tab"
            aria-selected={tab === 'pw'} onClick={() => switchTab('pw')}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className="form-card">
          {step === 'form' ? (
            <form className="form" style={{ maxWidth: 'none' }} onSubmit={requestCode}>
              {tab === 'pw' ? (
                <div className="field">
                  <label htmlFor="find-id">
                    아이디 <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(필수)</span>
                  </label>
                  <input
                    id="find-id" type="text" required value={loginId} autoComplete="username"
                    placeholder="가입하신 아이디"
                    onChange={(event) => setLoginId(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="field">
                <label htmlFor="find-name">
                  이름 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="find-name" type="text" required value={name} autoComplete="name"
                  placeholder="홍길동"
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="find-phone">
                  휴대폰 번호 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="find-phone" type="tel" required value={phone} inputMode="numeric"
                  autoComplete="tel" placeholder="010-1234-5678"
                  onChange={(event) => setPhone(event.target.value)}
                />
                <p className="hint">가입할 때 등록한 번호로 인증번호를 보내드립니다.</p>
              </div>

              {statusLine}

              <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
                {isPending ? '확인 중…' : '인증번호 받기'}
              </button>
            </form>
          ) : null}

          {step === 'code' ? (
            <form className="form" style={{ maxWidth: 'none' }} onSubmit={submitCode}>
              <div className="field">
                <label htmlFor="find-code">
                  인증번호 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="find-code" type="text" required value={code} inputMode="numeric"
                  maxLength={6} autoComplete="one-time-code" placeholder="문자로 받은 6자리"
                  onChange={(event) => setCode(event.target.value)}
                />
                <p className="hint">
                  {phone} 로 보냈습니다.{' '}
                  {secondsLeft > 0
                    ? `남은 시간 ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                    : '유효시간이 지났습니다. 재발송해주세요.'}
                </p>
              </div>

              {statusLine}

              <button
                className="btn btn--primary btn--lg btn--block" type="submit"
                disabled={isPending || secondsLeft <= 0}
              >
                {isPending ? '확인 중…' : '인증 확인'}
              </button>
              <button
                className="btn btn--ghost btn--block" type="button" disabled={isPending}
                onClick={() => {
                  setCode('');
                  setMessage(null);
                  setStep('form');
                }}
              >
                번호 다시 입력 / 재발송
              </button>
            </form>
          ) : null}

          {step === 'result' && tab === 'id' && foundId ? (
            <div className="form" style={{ maxWidth: 'none' }}>
              <p className="my-card__status my-card__status--pass">
                회원님의 아이디는 <b>{foundId.loginId}</b> 입니다. (가입일 {foundId.joinedAt})
              </p>
              {foundId.socialProvider ? (
                <p className="my-card__status my-card__status--fail">
                  {foundId.socialProvider} 로그인으로 가입된 계정입니다. {foundId.socialProvider} 로그인을 이용해주세요.
                </p>
              ) : null}
              <Link className="btn btn--primary btn--lg btn--block" href="/login">
                로그인하러 가기
              </Link>
            </div>
          ) : null}

          {step === 'result' && tab === 'pw' ? (
            <form className="form" style={{ maxWidth: 'none' }} onSubmit={submitPassword}>
              <div className="field">
                <label htmlFor="new-pw">
                  새 비밀번호 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="new-pw" type="password" required autoComplete="new-password"
                  placeholder="4~20자" value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="new-pw2">
                  새 비밀번호 확인 <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(필수)</span>
                </label>
                <input
                  id="new-pw2" type="password" required autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력하세요" value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                />
              </div>

              {statusLine}

              <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
                {isPending ? '변경 중…' : '비밀번호 변경'}
              </button>
            </form>
          ) : null}

          {/* 원래 시안대로 돌아가기 링크 하나만 둡니다.
              (.auth-links에는 자식 간 여백이 없어 "로그인|회원가입"이 붙어 보였습니다) */}
          <p className="auth-links">
            <Link href="/login">← 로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
