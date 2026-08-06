'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { COURSES } from '@/features/korhrd/data/courses';
import { useCart } from '@/features/korhrd/lib/useCart';
import CourseRow from '@/features/korhrd/components/course/CourseRow';
import CartBar from '@/features/korhrd/components/course/CartBar';
import styles from './page.module.css';

/**
 * 수강신청 목록.
 *
 * 프로토타입 원본: korhrd-site/courses.html + main.js initCourseList()
 *
 * 정해진 규칙
 *  - 필터는 그룹끼리 AND, 같은 그룹 안에서는 OR
 *  - 페이지네이션 없음 — 조건에 맞는 과정을 한 번에 모두 보여줍니다
 *  - 사이드바 개수는 하드코딩하지 않고 데이터에서 매번 다시 셉니다
 *  - 선택한 조건이 있는 그룹에만 '초기화' 버튼이 박스 오른쪽 위에 생깁니다
 *  - /courses?cat=상담 · ?purpose=취업 준비 · ?age=60대 이상 으로 들어오면 해당 필터가 켜집니다
 */
type Group = 'cat' | 'purpose' | 'age' | 'gov';

const GROUP_LABEL: Record<Group, string> = {
  cat: '과정별',
  purpose: '목적',
  age: '연령대',
  gov: '주무부처',
};

/** 사이드바에 보여줄 순서 — 데이터의 등장 순서가 아니라 기획이 정한 순서입니다 */
const CAT_ORDER = [
  '복지·돌봄', '교육·아동', '상담', '병원·의료', '반려동물', '뷰티',
  '마케팅·사무', 'ESG·환경', 'IT·디지털', '창업·취미', '기타',
];
const PURPOSE_ORDER = ['취업 준비', '이직·전직', '부업·창업', '자기계발', '심리상담', '아동·교육'];
const AGE_ORDER = ['20~30대', '40~50대', '60대 이상'];

type Sort = 'popular' | 'new' | 'name';

/** URL 초기값은 서버(page.tsx)에서 받습니다 — useSearchParams는 Suspense를 요구해
 *  클라이언트 하이드레이션이 매달리는 문제가 있어 prop으로 바꿨습니다. */
export default function CoursesClient({ initial = {} }: {
  initial?: { cat?: string; purpose?: string; age?: string };
}) {
  const cart = useCart();

  const [picked, setPicked] = useState<Record<Group, string[]>>(() => ({
    cat: initial.cat ? [initial.cat] : [],
    purpose: initial.purpose ? [initial.purpose] : [],
    age: initial.age ? [initial.age] : [],
    gov: [],
  }));
  const [sort, setSort] = useState<Sort>('popular');
  const [filterOpen, setFilterOpen] = useState(false);

  /** 사이드바 개수 — 항상 전체 데이터 기준입니다 (다른 필터의 영향을 받지 않습니다) */
  const countOf = (group: Group, value: string) =>
    COURSES.filter((c) =>
      group === 'cat' ? c.c.includes(value as never)
      : group === 'purpose' ? c.p.includes(value as never)
      : group === 'age' ? c.a.includes(value as never)
      : c.g === value,
    ).length;

  const toggle = (group: Group, value: string) =>
    setPicked((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));

  const rows = useMemo(() => {
    const hit = COURSES.filter((c) => {
      if (picked.cat.length && !picked.cat.some((v) => c.c.includes(v as never))) return false;
      if (picked.purpose.length && !picked.purpose.some((v) => c.p.includes(v as never))) return false;
      if (picked.age.length && !picked.age.some((v) => c.a.includes(v as never))) return false;
      if (picked.gov.length && !picked.gov.includes(c.g)) return false;
      return true;
    });
    const byName = (a: typeof hit[0], b: typeof hit[0]) => a.n.localeCompare(b.n, 'ko');
    if (sort === 'name') return [...hit].sort(byName);
    if (sort === 'new') return [...hit].sort((a, b) => b.year - a.year || byName(a, b));
    return [...hit].sort((a, b) => (a.rank || 99) - (b.rank || 99) || byName(a, b));
  }, [picked, sort]);

  const filterGroup = (group: Group, values: string[], suffix = '') => {
    const chosen = picked[group];
    return (
      <div className="filter-group" key={group}>
        <p className="filter-group__title">{GROUP_LABEL[group]}</p>
        {chosen.length > 0 && (
          <button
            className="filter-group__reset" type="button"
            aria-label={`${GROUP_LABEL[group]} 조건 초기화`}
            onClick={() => setPicked((p) => ({ ...p, [group]: [] }))}
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.9-4.16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.7 2.2v3.1h-3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            초기화
          </button>
        )}
        {values.map((v) => (
          <button
            key={v} className="filter-item" type="button"
            aria-pressed={chosen.includes(v)} onClick={() => toggle(group, v)}
          >
            {v}{suffix} <span className="num">{countOf(group, v)}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">수강신청</li>
        </ol>
      </nav>

      {/* 모바일 전용 검색바 — 데스크톱은 헤더 검색을 씁니다 */}
      <form className="m-search" action="/courses" method="get" role="search">
        <label className="sr-only" htmlFor="m-search-input">자격증 검색</label>
        <input id="m-search-input" name="q" type="search" autoComplete="off" placeholder="어떤 자격증을 찾고 계신가요?" />
        <button type="submit" aria-label="검색">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </form>

      <div className="page-head page-head--row">
        <h1>수강신청</h1>
        <p className="promo-chip">
          <img src="/promo-policy.png" alt="" aria-hidden="true" width={34} height={34} />
          <span><b>2026 취업 장려 정책!</b>전 과정 무료 수강 가능</span>
        </p>
      </div>

      <div className="layout-side">
        {/* 모바일 전용 — 사이드바를 열고 닫는 드롭다운 */}
        <button
          className="filter-toggle" type="button"
          aria-expanded={filterOpen} aria-controls="course-filters"
          onClick={() => setFilterOpen((v) => !v)}
        >
          <span>자격증 과정 전체</span>
          <span className="chev" aria-hidden="true">⌄</span>
        </button>

        <aside id="course-filters" aria-label="검색 조건" hidden={!filterOpen ? undefined : undefined}>
          {filterGroup('cat', CAT_ORDER, ' 과정')}
          {filterGroup('purpose', PURPOSE_ORDER)}
          {filterGroup('age', AGE_ORDER)}
        </aside>

        <div>
          <div className="toolbar">
            <p className="toolbar__result">전체 <b>{rows.length}</b>개 과정</p>
            <div className="sort-group" role="group" aria-label="정렬">
              {([['popular', '인기순'], ['new', '신규순'], ['name', '가나다순']] as const).map(([key, label]) => (
                <button key={key} type="button" aria-pressed={sort === key} onClick={() => setSort(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 페이지 나눔 없이 전부 보여줍니다 */}
          <div className={styles.list}>
            {rows.length === 0 ? (
              <div className="empty-state">
                <strong>조건에 맞는 과정이 없습니다</strong>
                조건을 하나씩 해제하시면 더 많은 과정을 보실 수 있습니다.
              </div>
            ) : (
              rows.map((c) => (
                <CourseRow
                  key={c.n} course={c}
                  selected={cart.has(c.n)}
                  onToggleSelect={() => cart.toggle(c.n)}
                  onSample={() => alert('강의 샘플은 준비 중입니다')}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <CartBar />
    </div>
  );
}
