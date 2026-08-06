'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { applyCartAction } from '@/features/korhrd/actions/cart-apply.actions';
import EnrollDoneModal from '@/features/korhrd/components/course/EnrollDoneModal';
import { findCourse } from '@/features/korhrd/data/courses';
import { useCart } from '@/features/korhrd/lib/useCart';

const won = (n: number) => n.toLocaleString('ko-KR') + '원';

/**
 * 화면 하단에 붙는 장바구니 바 (수강신청 목록 · 과정 상세에서 사용).
 *
 * · 담긴 과정이 없으면 아예 보이지 않습니다(.is-empty)
 * · 정가 합계는 취소선, 실제 결제액은 항상 0원 — "전 과정 무료 수강" 정책
 * · 상세페이지에서 담고 넘어온 직후에는 1.4초간 배경을 밝혀 위치를 알립니다(.is-bump)
 */
export default function CartBar() {
  const router = useRouter();
  const { items, toggle, clear } = useCart();
  const [bump, setBump] = useState(false);
  /* 신청이 끝나면 원본과 같은 완료 모달을 띄웁니다(토스트 대신) */
  const [done, setDone] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const prevCount = useRef<number | null>(null);

  const [toastOn, setToastOn] = useState(false);
  useEffect(() => {
    if (!toast) return;
    /* 다음 프레임에 켜야 .toast 의 opacity 전환이 재생됩니다 (원본 showToast 와 같은 방식) */
    const raf = requestAnimationFrame(() => setToastOn(true));
    const t = setTimeout(() => { setToast(null); setToastOn(false); }, 4000);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [toast]);

  /** 담긴 과목을 실제 수강신청으로 넣습니다. 비로그인이면 로그인으로 보냅니다. */
  const apply = () => {
    startTransition(async () => {
      const result = await applyCartAction({ courses: items });
      if (!result.success) {
        router.push('/login?redirect=/courses');
        return;
      }
      if (result.applied.length > 0) {
        // 원본은 신청 직후 목록에 머문 채 완료 모달을 띄웁니다.
        // (모달의 "나의 강의실로"를 눌러야 이동)
        setDone(result.applied);
        clear();
        router.refresh();
        return;
      }

      const parts: string[] = [];
      if (result.duplicated.length) parts.push(`${result.duplicated.length}개는 이미 신청한 과목입니다`);
      if (result.failed.length) parts.push(`${result.failed.length}개 실패`);
      setToast(parts.join(' · ') || '신청할 과목이 없습니다.');
      if (result.duplicated.length) clear();
    });
  };

  useEffect(() => {
    /* 첫 렌더(저장된 값 복원)에는 반응하지 않고, 실제로 늘었을 때만 강조합니다 */
    if (prevCount.current !== null && items.length > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 1400);
      prevCount.current = items.length;
      return () => clearTimeout(t);
    }
    prevCount.current = items.length;
  }, [items.length]);

  const listPrice = items.reduce((sum, n) => sum + (findCourse(n)?.price ?? 0), 0);

  return (
    <div
      className={['cart-bar', items.length === 0 && 'is-empty', bump && 'is-bump'].filter(Boolean).join(' ')}
      aria-live="polite"
    >
      <div className="cart-bar__in">
        <p className="cart-bar__count">선택한 과목 <b>{items.length}</b>개</p>

        <div className="cart-bar__chips">
          {items.map((name) => (
            <span className="cart-chip" key={name}>
              {name}{' '}
              <button type="button" aria-label={`${name} 선택 해제`} onClick={() => toggle(name)}>✕</button>
            </span>
          ))}
        </div>

        <p className="cart-bar__total">
          <del>{won(listPrice)}</del>
          <span className="cart-bar__total-label">수강료</span>
          <strong>0원</strong>
        </p>

        {/* data-enroll 은 CSS가 거는 자리입니다 — course.css 가 이 속성으로 버튼 크기를
            잡고, responsive.css 는 560px 이하에서 grid-area:cta 로 전폭 배치합니다.
            빼면 좁은 화면에서 버튼이 그리드 칸을 못 받아 반쪽으로 남습니다. */}
        <button
          className="btn btn--primary" type="button" data-enroll="cart" disabled={isPending}
          onClick={apply}
        >
          {isPending ? '신청 중…' : '선택과목 수강신청'}
        </button>
      </div>

      <EnrollDoneModal courses={done} onClose={() => setDone([])} />

      {/* 안내 토스트 — 모양은 course.css 의 .toast 가 담당합니다.
          인라인 스타일로 흉내 내면 전달본과 색·모서리·전환이 어긋납니다. */}
      {toast ? (
        <div className={`toast${toastOn ? ' is-on' : ''}`} role="status">{toast}</div>
      ) : null}
    </div>
  );
}
