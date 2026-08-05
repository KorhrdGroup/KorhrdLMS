'use client';

import { useEffect, useRef, useState } from 'react';

export interface LiveRow {
  state: 'done' | 'issued';
  name: string;
  course: string;
  date: string;
}

/**
 * 실시간 활동 티커 — 1초마다 한 줄씩 위로 올라갑니다.
 *
 * 주의할 점 (프로토타입에서 실제로 겪은 문제입니다)
 *  · 목록 전체를 그대로 두면 박스가 항목 수만큼 늘어납니다. 뷰포트 높이를 먼저 0으로 접고
 *    옆 칸(전화·카카오)이 정한 높이를 잰 다음, 그 높이 안에 VISIBLE줄이 꽉 차도록 gap을 계산합니다.
 *  · 끊김 없이 반복하려고 항목을 한 벌 복제해 붙입니다.
 *  · prefers-reduced-motion 이면 움직이지 않고 그대로 둡니다.
 */
const VISIBLE = 4;

export default function LiveTicker({ rows }: { rows: LiveRow[] }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [animated, setAnimated] = useState(false);
  const [step, setStep] = useState(0);
  const paused = useRef(false);

  /* 높이·간격 계산 */
  useEffect(() => {
    const view = viewRef.current, list = listRef.current;
    if (!view || !list || rows.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const box = view.closest('.live-box') as HTMLElement | null;
    if (!box) return;

    const itemH = list.children[0].getBoundingClientRect().height;
    view.style.height = '0px'; // 먼저 접어야 박스가 옆 칸 높이를 그대로 갖습니다
    const cs = getComputedStyle(box);
    let contentH =
      box.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);

    /* 옆 칸이 없는 좁은 화면에서는 박스가 제목 높이밖에 안 되므로 최소 높이를 확보합니다 */
    const minH = itemH * VISIBLE + 6 * (VISIBLE - 1);
    if (contentH < minH) contentH = minH;

    list.style.gap = `${Math.max(6, (contentH - itemH * VISIBLE) / (VISIBLE - 1))}px`;
    view.style.height = `${contentH}px`;
    setAnimated(true);
  }, [rows.length]);

  /* 한 줄씩 올리기 */
  useEffect(() => {
    if (!animated) return;
    const t = setInterval(() => {
      if (!paused.current) setStep((s) => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [animated]);

  const list = listRef.current;
  const rowStep =
    list && list.children.length > 1
      ? (list.children[1] as HTMLElement).offsetTop - (list.children[0] as HTMLElement).offsetTop
      : 0;

  /* 원본 한 바퀴를 돌면 애니메이션 없이 처음으로 되돌립니다 */
  const wrapped = step >= rows.length;
  const offset = wrapped ? 0 : -rowStep * step;
  useEffect(() => {
    if (wrapped) {
      const id = requestAnimationFrame(() => setStep(0));
      return () => cancelAnimationFrame(id);
    }
  }, [wrapped]);

  const items = animated ? [...rows, ...rows] : rows; // 끊김 없는 반복용 사본

  return (
    <div
      className="live-view" ref={viewRef}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <ul
        className="live-list" ref={listRef}
        style={{
          transform: `translateY(${offset}px)`,
          transition: wrapped ? 'none' : 'transform .5s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {items.map((r, i) => (
          <li key={`${r.name}-${r.course}-${i}`}>
            <span className={`state state--${r.state}`}>{r.state === 'done' ? '수강완료' : '발급완료'}</span>
            <span>{r.name}</span>
            <span>{r.course}</span>
            <span className="date">{r.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
