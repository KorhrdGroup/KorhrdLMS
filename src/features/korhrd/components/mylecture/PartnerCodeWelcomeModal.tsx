'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { registerMyPartnerCodeAction } from '@/features/korhrd/actions/partner-code.actions';

/**
 * 소셜 가입 직후(?welcome=social) 한 번 뜨는 파트너스 코드 입력 팝업.
 * 일반 회원가입 폼과 달리 소셜 가입은 입력 단계가 없어서 여기서 받습니다.
 * 코드가 없으면 "건너뛰기"로 그냥 닫으면 됩니다.
 */
export default function PartnerCodeWelcomeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    // 새로고침해도 팝업이 다시 뜨지 않게 welcome 파라미터를 지웁니다
    router.replace('/mylecture');
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await registerMyPartnerCodeAction(code);
      if (result.success) {
        window.alert(result.message);
        close();
      } else {
        setError(result.message);
      }
    });
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15,18,25,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 12, padding: 24 }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>가입을 환영합니다! 🎉</h2>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 16 }}>
          파트너스 코드가 있으시면 입력해주세요. 없으면 건너뛰셔도 됩니다.
        </p>

        <input
          type="text"
          placeholder="파트너스 코드 (선택)"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') submit(); }}
          style={{
            width: '100%', height: 44, borderRadius: 8,
            border: '1px solid #E5E8EB', padding: '0 12px', fontSize: 14,
          }}
        />
        {error ? (
          <p style={{ fontSize: 12.5, color: '#F04452', marginTop: 6 }}>{error}</p>
        ) : null}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn btn--ghost btn--block" type="button" onClick={close}
          >
            없어요, 건너뛰기
          </button>
          <button
            className="btn btn--primary btn--block" type="button"
            onClick={submit} disabled={isPending}
          >
            {isPending ? '등록 중…' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
