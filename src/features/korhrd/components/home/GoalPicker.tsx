'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useVisibleCourses } from '@/features/korhrd/lib/visible-courses-context';
import type { AgeBand, Course, Purpose } from '@/features/korhrd/lib/types';
import CourseCard from '@/features/korhrd/components/course/CourseCard';
import Carousel from '@/features/korhrd/components/ui/Carousel';
import PillRow from '@/features/korhrd/components/ui/PillRow';

/**
 * "어떤 목적으로 자격증을 찾으세요?" — 목적·연령대를 고르면 과정 4개를 추천합니다.
 * 프로토타입 원본: main.js initGoalSection()
 *
 * 두 가지 규칙이 있습니다.
 *  · 메인 카드에는 자격증 2개를 묶은 과정(이름에 '&')은 노출하지 않습니다.
 *    (수강신청 목록에는 그대로 나옵니다)
 *  · 선택한 목적에서 과정이 0개인 연령대 칩은 아예 숨깁니다 — 빈 결과를 만들지 않기 위해서입니다.
 */
const PURPOSES: Purpose[] = ['취업 준비', '이직·전직', '부업·창업', '자기계발', '심리상담', '아동·교육'];
const AGES: (AgeBand | '전체')[] = ['전체', '20~30대', '40~50대', '60대 이상'];

const single = (c: Course) => !c.n.includes('&');

export default function GoalPicker() {
  const [goal, setGoal] = useState<Purpose>('취업 준비');
  const [age, setAge] = useState<AgeBand | '전체'>('전체');
  /* 노출 중인 과정만 추천합니다 — 자료 없는 과정이 메인에 뜨면 안 됩니다 */
  const catalog = useVisibleCourses();

  /* 목적 칩의 숫자는 묶음 과정까지 포함한 전체 기준입니다 */
  const goalCount = useMemo(
    () => Object.fromEntries(PURPOSES.map((p) => [p, catalog.filter((c) => c.p.includes(p)).length])),
    [catalog],
  );

  const countFor = (a: AgeBand | '전체') =>
    catalog.filter(
      (c) => single(c) && c.p.includes(goal) && (a === '전체' || c.a.includes(a)),
    ).length;

  const visibleAges = AGES.filter((a) => a === '전체' || countFor(a) > 0);
  /* 고른 연령대가 숨겨졌다면 '전체'로 되돌립니다 */
  const activeAge = visibleAges.includes(age) ? age : '전체';

  /* 고른 연령대와 맞는 과정을 앞에 세우고, 그 뒤를 같은 목적의 나머지 과정으로
     채웁니다 (2026-08-14, 디자인 요청) — 심리상담 × 60대처럼 딱 맞는 과정이
     한둘뿐인 조합에서 화면이 비어 보이지 않게, 연령이 겹쳐도 많이 보여줍니다.
     연령 뱃지는 실제로 그 연령에 맞는 카드에만 답니다. */
  const cards = useMemo(() => {
    const byRank = (a: Course, b: Course) =>
      (a.rank || 99) - (b.rank || 99) || a.n.localeCompare(b.n, 'ko');
    const pool = catalog.filter((c) => single(c) && c.p.includes(goal));
    const matched = pool
      .filter((c) => activeAge === '전체' || c.a.includes(activeAge))
      .sort(byRank);
    const rest = activeAge === '전체' ? [] : pool.filter((c) => !matched.includes(c)).sort(byRank);
    return [...matched, ...rest].slice(0, 12);
  }, [goal, activeAge, catalog]);


  return (
    <div className="content">
      <PillRow label="목적" group="goal">
        {PURPOSES.map((p) => (
          <button key={p} className="pill" type="button" aria-pressed={goal === p} onClick={() => setGoal(p)}>
            {p} <b>{goalCount[p]}</b>
          </button>
        ))}
      </PillRow>

      <PillRow label="연령대" group="age">
        {visibleAges.map((a) => (
          <button key={a} className="pill" type="button" aria-pressed={activeAge === a} onClick={() => setAge(a)}>
            {a}
          </button>
        ))}
      </PillRow>

      {cards.length > 0 ? (
        /* 자동으로 넘어가는 캐러셀 — 넓은 화면도 4장씩 옆으로 흐릅니다
           (.card-carousel, overrides.css). 좁은 화면 스와이프는 전달본
           appendix.css 의 .card-grid 규칙 그대로입니다. */
        <div className="mt-5">
          <Carousel className="card-grid card-carousel" pageBy="cards" autoMs={4000}
                    label="추천 과정" dotsLabel="추천 과정 목록 이동">
            {cards.map((c) => (
              <CourseCard
                key={c.n} course={c}
                /* 연령을 고른 상태여도 채움 카드가 섞이므로, 실제 맞는 카드에만 답니다 */
                ageLabel={activeAge !== '전체' && c.a.includes(activeAge) ? activeAge : undefined}
              />
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="card-grid mt-5">
          <p className="empty-state">해당 조건의 과정이 없습니다.</p>
        </div>
      )}

      <p className="text-center mt-5">
        {/* 고른 조건을 들고 가지 않습니다 — 목록 전체로 (2026-08-14, 디자인 요청) */}
        <Link className="btn btn--ghost btn--quiet" href="/courses">
          과정 전체 보러가기 →
        </Link>
      </p>
    </div>
  );
}
