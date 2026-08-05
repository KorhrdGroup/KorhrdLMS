import type { Review } from '@/features/korhrd/lib/types';

/**
 * 과정 상세의 후기 마르퀴 — 카드가 가로로 끊김 없이 흘러갑니다.
 *
 * 같은 목록을 두 벌 이어 붙이고 CSS(.drev-track)가 -50% 까지 밀어 무한 루프처럼 보이게 합니다.
 * 사본은 보조기기에 중복 노출되지 않도록 aria-hidden 입니다.
 */
export default function ReviewMarquee({ reviews }: { reviews: Review[] }) {
  const card = (r: Review, dup: boolean) => (
    <li className="drev__card" key={`${r.id}${dup ? '-dup' : ''}`} aria-hidden={dup || undefined}>
      <div className="drev__top">
        <span className="ph drev__ava" aria-hidden="true" />
        <div>
          <p className="drev__tit">{r.title}</p>
          <p className="drev__who">{r.author} 수강생</p>
        </div>
      </div>
      <p className="drev__body">{r.body}</p>
      <p className="drev__tags">
        <span>{r.course}</span>
        {r.alsoCourses.length > 0 && <em>외 {r.alsoCourses.length}개</em>}
      </p>
    </li>
  );

  return (
    <div className="drev-marquee" aria-label="수강생 합격후기">
      <ul className="drev-track">
        {reviews.map((r) => card(r, false))}
        {reviews.map((r) => card(r, true))}
      </ul>
    </div>
  );
}
