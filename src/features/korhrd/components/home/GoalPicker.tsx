'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useVisibleCourses } from '@/features/korhrd/lib/visible-courses-context';
import type { AgeBand, Course, Purpose } from '@/features/korhrd/lib/types';
import CourseCard from '@/features/korhrd/components/course/CourseCard';
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

  const cards = useMemo(
    () =>
      catalog.filter((c) => single(c) && c.p.includes(goal) && (activeAge === '전체' || c.a.includes(activeAge)))
        .sort((a, b) => (a.rank || 99) - (b.rank || 99) || a.n.localeCompare(b.n, 'ko'))
        .slice(0, 4),
    [goal, activeAge, catalog],
  );

  /* 더보기는 메인 카드와 달리 묶음 과정도 세어 목록 페이지와 개수를 맞춥니다 */
  const moreCount = catalog.filter(
    (c) => c.p.includes(goal) && (activeAge === '전체' || c.a.includes(activeAge)),
  ).length;
  const moreHref =
    `/courses?purpose=${encodeURIComponent(goal)}` +
    (activeAge === '전체' ? '' : `&age=${encodeURIComponent(activeAge)}`);

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

      <div className="card-grid mt-5">
        {cards.length > 0
          ? cards.map((c) => (
              <CourseCard
                key={c.n} course={c}
                /* 연령을 고른 상태면 뱃지도 그 연령으로 — 카드는 이미 그 조건으로 걸러진 것들입니다 */
                ageLabel={activeAge === '전체' ? undefined : activeAge}
              />
            ))
          : <p className="empty-state">해당 조건의 과정이 없습니다.</p>}
      </div>

      <p className="text-center mt-5">
        <Link className="btn btn--ghost btn--quiet" href={moreHref}>
          {goal}{activeAge === '전체' ? '' : ` · ${activeAge}`} 자격증 {moreCount}개 모두 보기 →
        </Link>
      </p>
    </div>
  );
}
