'use client';

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'korhrd_cart';

/**
 * 수강신청 장바구니.
 *
 * 페이지를 이동해도 유지되도록 sessionStorage 에 담습니다
 * (과정 상세에서 담은 과정이 수강신청 목록에서도 보여야 하기 때문).
 *
 * ⚠ 한 화면에서 useCart() 를 여러 곳이 부릅니다 — 목록의 '과목 선택' 버튼과 하단 장바구니 바.
 *   그래서 상태를 훅 안(useState)에 두면 서로를 못 봅니다. 모듈 하나가 들고 있고
 *   useSyncExternalStore 로 구독해야 어디서 담든 모두 같이 갱신됩니다.
 *
 * 서버 저장으로 바꿀 때는 read/write 두 함수만 교체하면 됩니다.
 */
let items: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

/** 서버 렌더 시의 값 — 매번 같은 참조여야 무한 렌더를 피할 수 있습니다 */
const EMPTY: string[] = [];

function read(): string[] {
  if (loaded) return items;
  loaded = true;
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    items = Array.isArray(v) ? v : [];
  } catch {
    items = [];
  }
  return items;
}

function write(next: string[]) {
  items = next;
  loaded = true;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 시크릿 모드 등에서 저장이 막혀도 화면 동작은 유지합니다 */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((name: string) => {
    const cur = read();
    write(cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]);
  }, []);

  const clear = useCallback(() => write([]), []);

  return { items: list, toggle, clear, has: (n: string) => list.includes(n) };
}
