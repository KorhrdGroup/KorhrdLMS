'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/features/korhrd/lib/useCart';

/**
 * 과정 상세 하단 고정 CTA (Figma 576:20475).
 *
 * 버튼은 바로 결제로 가지 않고 이 과정을 장바구니에 담아 수강신청 목록으로 보냅니다.
 * (여러 과정을 함께 신청하는 이용 흐름이라 그렇게 정했습니다)
 *
 * 카운트다운은 데모라 항상 7일 이내로 보이게 이번 주 일요일 자정으로 롤링합니다.
 * 실서비스에서는 endsAt 에 실제 이벤트 종료 일시를 넘기세요.
 */
const DAY = 86_400_000;

function resolveTarget(endsAt?: string) {
  const t = endsAt ? new Date(endsAt).getTime() : NaN;
  if (!Number.isNaN(t) && t > Date.now() && t - Date.now() <= 7 * DAY) return t;
  const d = new Date();
  const toSun = (7 - d.getDay()) % 7 || 7; // 오늘이 일요일이면 다음 주 일요일
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + toSun, 23, 59, 59).getTime();
}

/** 값을 자릿수별 박스로 나눠 그립니다 */
const Digits = ({ value }: { value: string }) => (
  <span className="timer__unit">
    {value.split('').map((ch, i) => <span className="timer__box" key={i}>{ch}</span>)}
  </span>
);

const pad = (n: number) => String(n).padStart(2, '0');

export default function DetailCta({ course, endsAt }: { course: string; endsAt?: string }) {
  const router = useRouter();
  const { toggle, has } = useCart();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = resolveTarget(endsAt);
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const apply = () => {
    if (!has(course)) toggle(course);
    router.push('/courses');
  };

  const s = left === null ? null : Math.floor(left / 1000);

  return (
    <div className="detail-cta">
      {/* 데스크탑에선 래퍼가 display:contents 라 한 줄, 모바일에선 두 줄로 바뀝니다 */}
      <div className="detail-cta__top">
        <p className="detail-cta__label">
          <img className="detail-cta__alarm" src="/alarm-clock.png" alt="" aria-hidden="true" />
          무료수강 이벤트
        </p>
        <button className="btn btn--cta" type="button" onClick={apply}>무료수강신청</button>
      </div>

      <div className="detail-cta__bottom">
        {s === null ? (
          /* 서버 렌더와 첫 페인트가 어긋나지 않도록 시간은 마운트 후에만 그립니다 */
          <p className="timer" aria-hidden="true" />
        ) : s <= 0 ? (
          <p className="timer">이벤트가 종료되었습니다</p>
        ) : (
          <>
            <p className="timer">
              <Digits value={String(Math.floor(s / 86400))} /><u className="timer__sep">일</u>
              <Digits value={pad(Math.floor(s / 3600) % 24)} /><u className="timer__sep">:</u>
              <Digits value={pad(Math.floor(s / 60) % 60)} /><u className="timer__sep">:</u>
              <Digits value={pad(s % 60)} />
            </p>
            <span className="detail-cta__left">남았습니다!</span>
          </>
        )}
      </div>
    </div>
  );
}
