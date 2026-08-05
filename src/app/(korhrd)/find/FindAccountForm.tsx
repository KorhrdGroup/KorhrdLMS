'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import {
  findLoginIdAction,
  requestPasswordResetAction,
} from '@/features/korhrd/actions/find-account.actions';

type Tab = 'id' | 'pw';

/**
 * 아이디·비밀번호 찾기 — 마크업은 korhrd 디자인(find.html), 조회는 members 테이블.
 * 계정 유무를 그대로 노출하지 않도록 실패 문구는 항상 동일합니다.
 */
export function FindAccountForm() {
  const [tab, setTab] = useState<Tab>('id');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const switchTab = (next: Tab) => {
    setTab(next);
    setMessage(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      if (tab === 'id') {
        const result = await findLoginIdAction({ name, phone });
        setMessage(
          result.success
            ? { ok: true, text: `회원님의 아이디는 ${result.loginId} 입니다. (가입일 ${result.joinedAt})` }
            : { ok: false, text: result.message },
        );
      } else {
        const result = await requestPasswordResetAction({ loginId, name, phone });
        setMessage({ ok: result.success, text: result.message });
      }
    });
  };

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="page-head text-center"><h1>아이디 · 비밀번호 찾기</h1></div>

        <div className="pill-row" role="tablist" aria-label="찾기 유형">
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
          <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
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
            </div>

            {message ? (
              <p className={`my-card__status my-card__status--${message.ok ? 'pass' : 'fail'}`}>
                {message.text}
              </p>
            ) : null}

            <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={isPending}>
              {isPending ? '확인 중…' : tab === 'id' ? '아이디 찾기' : '비밀번호 찾기'}
            </button>
          </form>

          <p className="auth-links">
            <Link href="/login">로그인</Link>
            <span aria-hidden="true">|</span>
            <Link href="/signup">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
