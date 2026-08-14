'use client';

import { useEffect, useState } from 'react';

/**
 * 첫 그림(서버·수화 직전)에서는 false, 수화가 끝난 뒤 true 가 됩니다.
 *
 * 아코디언의 `hidden` 속성을 걷어낼 때 씁니다. `hidden` 은 display:none 이라
 * 전환(transition)을 끊습니다 — 전달본 CSS(review.css `.faq__a[hidden]`)도
 * "JS 미실행 시 폴백" 이라고 적어 두고, 스크립트가 붙으면 걷어내는 것을
 * 전제로 만들어져 있습니다. 그래야 grid 0fr↔1fr 모프가 살아납니다.
 *
 * 첫 그림에는 그대로 두어, JS 가 아직(혹은 끝내) 안 붙어도 접힌 문항의 답이
 * 통째로 펼쳐져 보이지 않습니다.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
