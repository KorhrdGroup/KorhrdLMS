'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * 취득 절차의 FAQ 아코디언.
 * 프로토타입 원본: korhrd-site/assets/js/main.js 의 initFaq()
 *
 * 공용 Faq 컴포넌트(features/korhrd/components/ui/Faq)를 쓰지 않는 이유
 * ------------------------------------------------------------------
 * 이 화면은 원본 동작이 다릅니다.
 *  · 공용 Faq 는 한 번에 하나만 열립니다. 원본의 취득 절차는 각 항목을
 *    따로 여닫습니다(여러 개 동시에 열림).
 *  · 메인에서 /process#p-faq-4 처럼 특정 질문을 지목해 들어옵니다.
 *    그때는 그 항목만 펼치고 화면 가운데로 스크롤합니다.
 *  · id 는 메인의 링크가 걸려 있어 순서대로 붙이면 안 됩니다
 *    (보이는 순서는 4·5·6·1·2·3).
 *
 * 접힘은 CSS 가 grid-template-rows:0fr↔1fr 로 표현합니다(review.css).
 * 그래서 hidden 을 쓰지 않습니다 — .faq__a[hidden]{display:none} 이라
 * 붙어 있으면 펼침 애니메이션 없이 그냥 사라집니다.
 */
export type ProcessFaqItem = { id: string; q: string; a: React.ReactNode };

/** 주소창의 #해시를 구독합니다. 서버에는 해시가 오지 않으므로 빈 값으로 시작합니다. */
function useHash() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('hashchange', onChange);
      return () => window.removeEventListener('hashchange', onChange);
    },
    () => window.location.hash.slice(1),
    () => '',
  );
}

export default function ProcessFaq({ items }: { items: ProcessFaqItem[] }) {
  const hash = useHash();

  /* 사용자가 직접 누른 항목. 해시로 지목된 항목은 기본으로 열립니다. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  /* 해시가 바뀌면 직접 누른 상태를 지웁니다 — 원본도 지목된 것만 남기고 나머지를 닫습니다.
     (렌더 중 상태 조정 — React 가 권하는 방식입니다) */
  const [seenHash, setSeenHash] = useState(hash);
  if (seenHash !== hash) {
    setSeenHash(hash);
    setToggled({});
  }

  const isOpen = (id: string) => toggled[id] ?? id === hash;

  /* 지목된 항목을 화면 가운데로. 움직임을 줄이는 설정이면 바로 이동합니다. */
  useEffect(() => {
    if (!hash) return;
    const panel = document.getElementById(hash);
    const item = panel?.closest('.faq__item');
    if (!item) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    item.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }, [hash]);

  return (
    <div className="faq faq--wide">
      {items.map((item) => {
        const open = isOpen(item.id);
        return (
          <div className="faq__item" key={item.id}>
            <button
              className="faq__q" type="button"
              aria-expanded={open} aria-controls={item.id}
              onClick={() => setToggled((prev) => ({ ...prev, [item.id]: !open }))}
            >
              {item.q}
              <span className="arrow" aria-hidden="true">⌄</span>
            </button>
            {/* .faq__a 가 접힘을 맡고, 여백은 .faq__a-pad 가 담당합니다.
                내용을 바로 넣으면 접었을 때 여백만큼 남습니다. */}
            <div className="faq__a" id={item.id}>
              <div className="faq__a-inner">
                <div className="faq__a-pad">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
