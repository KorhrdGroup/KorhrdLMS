'use client';

import { useState } from 'react';

/**
 * 아코디언 FAQ. 한 번에 하나만 열립니다.
 * wide=true 면 .faq--wide (과정 상세·취득 절차에서 쓰는 넓은 형태)
 */
export default function Faq({
  items, wide = true, idPrefix = 'faq', defaultOpen = 0,
}: {
  items: { q: string; a: string }[];
  wide?: boolean;
  idPrefix?: string;
  /** 처음 열려 있을 항목의 인덱스. -1 이면 전부 닫힘 */
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={['faq', wide && 'faq--wide'].filter(Boolean).join(' ')}>
      {items.map((it, i) => {
        const id = `${idPrefix}-${i + 1}`;
        return (
          <div className="faq__item" key={id}>
            <button
              className="faq__q" type="button"
              aria-expanded={open === i} aria-controls={id}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              {it.q}
              <span className="arrow" aria-hidden="true">⌄</span>
            </button>
            {/* .faq__a 는 grid(0fr↔1fr 아코디언)이고 여백은 .faq__a-pad 가 담당합니다.
                내용을 바로 넣으면 여백이 사라지고 자식 요소마다 줄이 끊깁니다. */}
            <div className="faq__a" id={id}>
              <div className="faq__a-inner">
                <div className="faq__a-pad">{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
