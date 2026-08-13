'use client';

import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 공지 분류 필터 — 원본 notice.html 의 .sort-group(data-toggle-group) 그대로입니다.
 *
 * notices.category 컬럼(어드민 공지 등록/수정의 "분류")과 연결돼 실제로 목록을
 * 거릅니다. 선택값은 URL(?cat=)에 실어 서버(page.tsx)가 걸러냅니다 —
 * 페이지네이션(?page=)과 같은 방식이라 새로고침해도 유지됩니다.
 * 분류를 바꾸면 1페이지로 돌아갑니다.
 */
export const NOTICE_CATEGORIES = ['전체', '수강 안내', '신규 과정', '이벤트'] as const;

export function NoticeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('cat') ?? '전체';

  return (
    <div className="sort-group" role="group" aria-label="분류">
      {NOTICE_CATEGORIES.map((name) => (
        <button
          key={name} type="button"
          aria-pressed={current === name}
          onClick={() => {
            router.push(name === '전체' ? '/support' : `/support?cat=${encodeURIComponent(name)}`);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
