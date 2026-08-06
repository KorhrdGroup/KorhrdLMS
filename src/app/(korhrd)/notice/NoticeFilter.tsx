'use client';

import { useState } from 'react';

/**
 * 공지 분류 필터 — 원본 notice.html 의 .sort-group(data-toggle-group) 그대로입니다.
 *
 * ⚠ 아직 목록을 거르지는 않습니다.
 * notices 테이블에 분류 컬럼이 없어서, 지금은 어떤 공지가 어느 분류인지 알 수 없습니다.
 * (원본도 프로토타입이라 aria-pressed 만 바꾸고 목록은 그대로 뒀습니다 — main.js
 *  initToggleGroups 는 group:change 이벤트만 쏘고, notice.html 은 그걸 듣지 않습니다.)
 *
 * 백엔드에 notices.category 가 추가되면
 *   1) 이 컴포넌트가 선택값을 상위로 올리고(onChange)
 *   2) page.tsx 가 그 값으로 slice 하기 전에 걸러내면
 * 끝납니다. 지금 상태에서 버튼을 눌러도 목록이 그대로인 것은 의도된 것입니다.
 */
export const NOTICE_CATEGORIES = ['전체', '수강 안내', '신규 과정', '이벤트'] as const;

export function NoticeFilter() {
  const [current, setCurrent] = useState<string>(NOTICE_CATEGORIES[0]);

  return (
    <div className="sort-group" role="group" aria-label="분류">
      {NOTICE_CATEGORIES.map((name) => (
        <button
          key={name} type="button"
          aria-pressed={current === name}
          onClick={() => setCurrent(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
