'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { changeMyPasswordAction } from '@/features/auth/actions/student-password.actions';

/**
 * 비밀번호 변경 폼.
 * 프로토타입 원본: korhrd-site/password-change.html — class 이름은 그대로 둡니다.
 *
 * 현재 비밀번호 확인·해싱은 전부 서버(액션)에서 합니다. 여기서는 값만 넘깁니다.
 */
export default function PasswordChangeForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setDone(false);

    startTransition(async () => {
      const result = await changeMyPasswordAction({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });

      if (result.success) {
        setDone(true);
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="form-card mt-5">
      <form className="form" style={{ maxWidth: 'none' }} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pw-now">
            현재 비밀번호 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="pw-now" type="password" required autoComplete="current-password"
            placeholder="현재 비밀번호를 입력하세요"
            value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pw-new">
            새 비밀번호 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="pw-new" type="password" required autoComplete="new-password"
            placeholder="4~20자"
            value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="pw-new2">
            새 비밀번호 확인 <span className="req" aria-hidden="true">*</span>
            <span className="sr-only">(필수)</span>
          </label>
          <input
            id="pw-new2" type="password" required autoComplete="new-password"
            placeholder="새 비밀번호를 다시 입력하세요"
            value={newPasswordConfirm}
            onChange={(event) => setNewPasswordConfirm(event.target.value)}
          />
        </div>

        {error ? <p className="my-card__status my-card__status--fail">{error}</p> : null}
        {done ? (
          <p className="my-card__status my-card__status--pass">
            비밀번호를 변경했습니다. 다음 로그인부터 새 비밀번호를 사용해주세요.
          </p>
        ) : null}

        <button className="btn btn--primary btn--lg btn--block mt-2" type="submit" disabled={isPending}>
          {isPending ? '변경 중…' : '비밀번호 변경'}
        </button>
        <Link className="btn btn--ghost btn--block" href="/mylecture?tab=mypage">취소</Link>
      </form>
    </div>
  );
}
