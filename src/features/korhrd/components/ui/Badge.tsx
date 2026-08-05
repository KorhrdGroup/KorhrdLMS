import type { ReactNode } from 'react';

export type BadgeTone =
  | 'best' | 'hot' | 'free' | 'age' | 'fee'
  | 'pass' | 'fail' | 'learning' | 'expired' | 'issued';

/**
 * 배지 — styles/ui.css 의 .badge 규칙을 그대로 씁니다.
 * 톤 이름은 프로토타입의 .badge--* 와 1:1로 대응합니다.
 */
export default function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
