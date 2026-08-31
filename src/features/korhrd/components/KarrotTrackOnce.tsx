'use client';

import { useEffect } from 'react';

import { trackKarrotEvent, type KarrotEvent } from '@/lib/karrot-pixel.client';

/**
 * 마운트 시 당근 전환 이벤트를 한 번 보내는 헬퍼.
 * 서버 컴포넌트 페이지(가입완료·결제완료 등)에 <KarrotTrackOnce event="..." />로 심습니다.
 */
export default function KarrotTrackOnce({ event }: { event: KarrotEvent }) {
  useEffect(() => {
    trackKarrotEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
