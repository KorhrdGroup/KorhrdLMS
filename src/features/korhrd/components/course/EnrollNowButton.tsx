'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { enrollCourseAction } from '@/features/korhrd/actions/enroll-now.actions';
import EnrollDoneModal, { type EnrollResult } from '@/features/korhrd/components/course/EnrollDoneModal';

/**
 * 한 과정을 바로 신청하는 버튼 — 과정 상세의 "무료수강신청",
 * 취업 길찾기 상세의 "바로 수강신청" 자리에 씁니다.
 *
 * 신청할 과정이 이미 정해진 자리라 목록으로 보내 다시 고르게 하지 않고,
 * 여기서 신청하고 장바구니와 같은 완료 모달을 띄웁니다.
 *
 * 겉모습은 원래 자리에 있던 링크와 같아야 하므로 className 을 그대로 받습니다
 * (.btn--cta / .btn.btn--primary). 여기서 새로 꾸미지 않습니다.
 */
export default function EnrollNowButton({ code, className, children }: {
  /** 과정코드 CRS-KH-xxxx */
  code: string;
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [done, setDone] = useState<EnrollResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastOn, setToastOn] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;
    /* 다음 프레임에 켜야 .toast 의 opacity 전환이 재생됩니다 (원본 showToast 와 같은 방식) */
    const raf = requestAnimationFrame(() => setToastOn(true));
    const t = setTimeout(() => { setToast(null); setToastOn(false); }, 4000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [toast]);

  const enroll = () => {
    startTransition(async () => {
      const result = await enrollCourseAction({ code });
      if (!result.success) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (result.applied.length > 0 || result.duplicated.length > 0) {
        // 이미 신청돼 있던 경우도 모달이 알려줍니다 — 아무것도 안 뜨면 고장으로 보입니다
        setDone({ applied: result.applied, duplicated: result.duplicated });
        router.refresh();
        return;
      }
      setToast(result.failed[0]?.message ?? '수강신청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    });
  };

  return (
    <>
      <button className={className} type="button" onClick={enroll} disabled={isPending}>
        {isPending ? '신청 중…' : children}
      </button>

      <EnrollDoneModal result={done} onClose={() => setDone(null)} />

      {/* 안내 토스트 — 모양은 전달본 CSS 의 .toast 가 담당합니다 */}
      {toast ? <div className={`toast${toastOn ? ' is-on' : ''}`} role="status">{toast}</div> : null}
    </>
  );
}
