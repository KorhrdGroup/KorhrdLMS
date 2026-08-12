'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { COURSES } from '@/features/korhrd/data/courses';
import { useCart } from '@/features/korhrd/lib/useCart';
import CourseRow from '@/features/korhrd/components/course/CourseRow';
import CartBar from '@/features/korhrd/components/course/CartBar';
import FloatingBanner from '@/features/korhrd/components/ui/FloatingBanner';
import ScrollTopButton from '@/features/korhrd/components/ui/ScrollTopButton';

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
 *  - 980px 이하에서는 사이드바를 접고(.is-collapsed) 바텀시트(.fsheet)로 대체합니다.
 *    상태는 계속 이 컴포넌트 한 곳에만 있고 시트는 그걸 비추기만 합니다.
 */
type Group = 'cat' | 'purpose' | 'age' | 'gov';

const GROUP_LABEL: Record<Group, string> = {
  cat: '과정',
  purpose: '목적',
  age: '연령',
  gov: '주무부처',
};

/** 사이드바에 보여줄 순서 — 데이터의 등장 순서가 아니라 기획이 정한 순서입니다 */
const CAT_ORDER = [
  '복지·돌봄', '교육·아동', '상담', '병원·의료', '반려동물', '뷰티',
  '마케팅·사무', 'ESG·환경', 'IT·디지털', '창업·취미', '기타',
];
const PURPOSE_ORDER = ['취업 준비', '이직·전직', '부업·창업', '자기계발', '심리상담', '아동·교육'];
const AGE_ORDER = ['20~30대', '40~50대', '60대 이상'];

/** 사이드바와 바텀시트가 같은 목록을 쓰도록 한 곳에 모읍니다 */
const FILTER_GROUPS: { group: Group; values: string[]; suffix?: string }[] = [
  { group: 'cat', values: CAT_ORDER, suffix: ' 과정' },
  { group: 'purpose', values: PURPOSE_ORDER },
  { group: 'age', values: AGE_ORDER },
];

type Sort = 'popular' | 'new' | 'name';

/** URL 초기값은 서버(page.tsx)에서 받습니다 — useSearchParams는 Suspense를 요구해
 *  클라이언트 하이드레이션이 매달리는 문제가 있어 prop으로 바꿨습니다. */
export default function CoursesClient({ initial = {} }: {
  initial?: { cat?: string; purpose?: string; age?: string; q?: string };
}) {
  const cart = useCart();
  const router = useRouter();

  /* 검색어. 헤더 검색과 이 화면의 검색바가 둘 다 /courses?q=… 로 넘어오므로
     URL 이 곧 상태입니다 — 여기서 따로 들고 있지 않습니다 (2026-08-12, 디자인 요청).
     이름·분야·주무부처 어디든 걸리면 보여 줍니다. 띄어쓰기와 대소문자는 무시합니다. */
  const query = (initial.q ?? '').trim();
  /* 입력칸에 지금 적혀 있는 말. URL 의 검색어로 시작하고, 주소가 바뀌면 따라갑니다.
     ✕ 로 지우면 입력칸을 비우고, 검색 중이었다면 전체 목록으로 되돌립니다. */
  const [term, setTerm] = useState(query);
  useEffect(() => { setTerm(query); }, [query]);
  const clearSearch = () => {
    setTerm('');
    if (query) router.push('/courses');
  };
  const norm = (v: string) => v.replace(/\s+/g, '').toLowerCase();
  const needle = norm(query);

  const [picked, setPicked] = useState<Record<Group, string[]>>(() => ({
    cat: initial.cat ? [initial.cat] : [],
    purpose: initial.purpose ? [initial.purpose] : [],
    age: initial.age ? [initial.age] : [],
    gov: [],
  }));
  const [sort, setSort] = useState<Sort>('popular');
  /** 바텀시트 열림 여부 — 980px 이하에서만 버튼이 보이므로 그때만 켜집니다 */
  const [filterOpen, setFilterOpen] = useState(false);
  /** 시트 왼쪽 레일에서 고른 그룹 (FILTER_GROUPS 인덱스) */
  const [sheetGroup, setSheetGroup] = useState(0);
  /**
   * 사이드바에서 펼쳐 둔 조건 묶음.
   *
   * 처음에는 **첫 묶음(과정)만** 펼칩니다. 셋 다 펼치면 사이드바가 895px 이라
   * 화면에 보이는 736px 을 넘겨 마지막 '연령'이 아예 안 보였고, 조건이 세 갈래라는
   * 것조차 알 수 없었습니다. 첫 묶음만 펼치면 555px 이라 세 제목이 모두 보이면서
   * 주로 쓰는 과정 조건은 바로 고를 수 있습니다.
   * 고른 개수는 접혀 있어도 제목 옆 배지로 보입니다.
   */
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isOpen = (group: Group) => openGroups[group] ?? group === FILTER_GROUPS[0].group;

  /* 시트가 열린 동안은 뒤 목록이 밀려 내려가지 않게 잠그고, Esc로 닫습니다 */
  useEffect(() => {
    if (!filterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [filterOpen]);

  /* 데스크톱으로 넓히면 사이드바가 다시 나오므로 시트는 닫아 둡니다 */
  useEffect(() => {
    const mq = window.matchMedia('(max-width:980px)');
    const apply = () => { if (!mq.matches) setFilterOpen(false); };
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

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
      if (needle && !norm([c.n, ...c.c, c.g].join(' ')).includes(needle)) return false;
      return true;
    });
    const byName = (a: typeof hit[0], b: typeof hit[0]) => a.n.localeCompare(b.n, 'ko');
    if (sort === 'name') return [...hit].sort(byName);
    if (sort === 'new') return [...hit].sort((a, b) => b.year - a.year || byName(a, b));
    return [...hit].sort((a, b) => (a.rank || 99) - (b.rank || 99) || byName(a, b));
  }, [picked, sort, needle]);

  const resetAll = () => setPicked({ cat: [], purpose: [], age: [], gov: [] });

  /* 고른 조건 수. 전에는 버튼에 고른 조건을 그대로 적었는데(원본 syncLabel —
     '복지·돌봄 과정 외 2개'), 검색바와 한 줄을 나눠 쓰게 되면서 조건이 길면
     버튼이 넓어져 검색칸을 밀어냈습니다. 이름은 '과정 필터' 로 고정하고
     몇 개를 골랐는지는 숫자로 보여 줍니다 (2026-08-12, 디자인 요청). */
  const chosenCount = FILTER_GROUPS.reduce((n, { group }) => n + picked[group].length, 0);

  /* 검색 폼. 좁은 화면은 고정 줄(.course-bar)에, 넓은 화면은 도구 줄(.toolbar)에
     놓입니다 — 자리가 달라 두 벌을 그리고 CSS 가 폭에 맞는 쪽만 보여 줍니다.
     상태(term)는 하나라 어느 쪽에 쳐도 같은 값입니다. id 만 다릅니다. */
  const searchForm = (id: string) => (
    <form className="m-search" action="/courses" method="get" role="search">
      <label className="sr-only" htmlFor={id}>자격증 검색</label>
      {/* 전달본 문구는 '어떤 자격증을 찾고 계신가요?' 였습니다. 한 줄을 필터
          버튼과 나눠 쓰게 되면서 375px 에서 잘려, 헤더 검색과 같은 짧은
          문구로 바꿉니다 (2026-08-12). */}
      <input
        id={id} name="q" type="search" autoComplete="off"
        placeholder="자격증 검색"
        value={term} onChange={(event) => setTerm(event.target.value)}
      />
      {/* 헤더 검색과 같은 자리·같은 모양입니다. 입력이 있을 때만 보입니다
          (type=search 의 브라우저 기본 ✕ 는 CSS 에서 감춥니다).
          동그라미와 ✕ 는 CSS 가 그립니다 — 시안(Figma 64:5454)의 아이콘 파일을
          마스크로 씁니다. */}
      <button
        type="button" className="m-search__clear" aria-label="검색어 지우기"
        hidden={term.length === 0} onClick={clearSearch}
      />
      <button type="submit" aria-label="검색">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );

  const filterGroup = (group: Group, values: string[], suffix = '') => {
    const chosen = picked[group];
    return (
      <div className={`filter-group${isOpen(group) ? '' : ' is-folded'}`} key={group}>
        {/* 제목을 눌러 접었다 폅니다. 화살표는 전달본 공통 셰브론(.chev)입니다 */}
        <button
          className="filter-group__title" type="button"
          aria-expanded={isOpen(group)} aria-controls={`filter-items-${group}`}
          onClick={() => setOpenGroups((p) => ({ ...p, [group]: !isOpen(group) }))}
        >
          {GROUP_LABEL[group]}
          {/* 접었을 때도 몇 개 고랐는지 보이게 합니다 — 펼치지 않으면 알 수 없었습니다 */}
          {chosen.length > 0 && <span className="filter-group__count">{chosen.length}</span>}
          <span className="chev" aria-hidden="true">⌄</span>
        </button>
        {/* FAQ 와 같은 방식으로 부드럽게 여닫습니다 — 바깥이 0fr↔1fr 로 모프하고
            안쪽이 잘라냅니다(review.css .faq__a / .faq__a-inner).
            hidden 을 쓰면 그냥 사라져서 애니메이션이 재생되지 않습니다.
            대신 접혀 있는 동안 키보드로 들어가지 않게 inert 를 겁니다. */}
        <div className="filter-group__panel" id={`filter-items-${group}`} inert={!isOpen(group)}>
          <div className="filter-group__panel-inner">
            {values.map((v) => (
              <button
                key={v} className="filter-item" type="button"
                aria-pressed={chosen.includes(v)} onClick={() => toggle(group, v)}
              >
                {v}{suffix} <span className="num">{countOf(group, v)}</span>
              </button>
            ))}
            {/* 초기화는 목록 아래에 둡니다. 오른쪽 위에 있으면 접기 화살표를 가려
                아코디언으로 안 보였습니다. 접힌 동안에는 개수 배지가 대신 알립니다. */}
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">수강신청</li>
        </ol>
      </nav>

      <div className="page-head page-head--row">
        <h1>수강신청</h1>
        <p className="promo-chip">
          <img src="/promo-policy.png" alt="" aria-hidden="true" width={34} height={34} />
          <span><b>2026 취업 장려 정책!</b>전 과정 무료 수강 가능</span>
        </p>
      </div>

      {/* 검색바 + 필터 버튼 한 줄 — 좁은 화면 전용입니다(데스크톱은 헤더 검색과
          펼쳐진 사이드바를 씁니다). 스크롤해도 헤더 아래에 붙어 있습니다
          (2026-08-12, 디자인 요청). 두 조각 다 원래 있던 것이고 자리만 모았습니다. */}
      <div className="course-bar">
        {searchForm('m-search-input')}

        {/* 바텀시트를 여는 버튼 */}
        <button
          className="filter-toggle" type="button" data-filter-toggle
          aria-expanded={filterOpen} aria-controls="course-filters"
          onClick={() => setFilterOpen((v) => !v)}
        >
          <span data-filter-toggle-label>과정 필터</span>
          {chosenCount > 0 ? (
            <span className="filter-toggle__count">
              {chosenCount}
              <span className="sr-only">개 조건 선택됨</span>
            </span>
          ) : null}
          <span className="chev" aria-hidden="true">⌄</span>
        </button>
      </div>

      <div className="layout-side">
        {/* 980px 이하에서는 .is-collapsed 가 이 사이드바를 감추고 시트가 대신 뜹니다.
            DOM에는 남겨둬야 필터 상태와 개수 계산이 한 곳에 유지됩니다.
            접힘은 hidden 속성이 아니라 클래스로 둡니다 — hidden은 전역 리셋에서
            !important라 데스크톱으로 넓혔을 때 되돌릴 수 없습니다 (course.css 16절). */}
        <aside id="course-filters" className="is-collapsed" aria-label="검색 조건">
          {FILTER_GROUPS.map(({ group, values, suffix }) => filterGroup(group, values, suffix))}
        </aside>

        <div>
          <div className="toolbar">
            {/* 넓은 화면에서는 검색이 이 줄로 들어옵니다 — 목록 바로 위라
                무엇을 찾아 몇 개가 나왔는지가 한눈에 이어집니다
                (2026-08-12, 디자인 요청). */}
            <div className="toolbar__search">{searchForm('course-search-wide')}</div>
            <p className="toolbar__result">
              {query ? (
                <>
                  ‘{query}’ 검색 결과 <b>{rows.length}</b>개 과정
                </>
              ) : (
                <><b>{rows.length}</b>개 과정</>
              )}
            </p>
            <div className="sort-group" role="group" aria-label="정렬">
              {([['popular', '인기순'], ['new', '신규순'], ['name', '가나다순']] as const).map(([key, label]) => (
                <button key={key} type="button" aria-pressed={sort === key} onClick={() => setSort(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 페이지 나눔 없이 전부 보여줍니다 */}
          {/* 행 사이 간격은 course.css 의 .course-row + .course-row (11px) 가 잡습니다.
              여기에 flex gap 을 더 주면 두 값이 합쳐져 간격이 벌어집니다. */}
          <div>
            {rows.length === 0 ? (
              <div className="empty-state">
                {query ? (
                  <>
                    <strong>‘{query}’ 에 맞는 과정이 없습니다</strong>
                    다른 말로 찾아보시거나, <Link href="/courses">전체 과정</Link>을 둘러보세요.
                  </>
                ) : (
                  <>
                    <strong>조건에 맞는 과정이 없습니다</strong>
                    조건을 하나씩 해제하시면 더 많은 과정을 보실 수 있습니다.
                  </>
                )}
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
    </div>

      {/* 시트와 장바구니 바는 .container 밖에 둡니다 — 원본(courses.html)도 <main> 밖에
          있습니다. 안에 넣으면 컨테이너의 max-width·좌우 여백을 같이 받아, 화면 폭을
          꽉 채워야 할 장바구니 바가 안쪽으로 밀립니다. */}
      <div className={`fsheet${filterOpen ? ' is-open' : ''}`}>
        <div className="fsheet__dim" onClick={() => setFilterOpen(false)} />
        <div className="fsheet__panel" role="dialog" aria-modal="true" aria-label="검색 조건">
          <div className="fsheet__head">
            <h2>자격증 과정</h2>
            <button
              className="fsheet__close" type="button" aria-label="닫기"
              onClick={() => setFilterOpen(false)}
            >✕</button>
          </div>

          <div className="fsheet__body">
            {/* aria-selected 는 CSS가 거는 자리라 그대로 둬야 합니다(course.css).
                button에는 지원되지 않는 속성이어서 role만 tab으로 맞춥니다. */}
            <div className="fsheet__groups" role="tablist">
              {FILTER_GROUPS.map(({ group }, i) => (
                <button
                  key={group} className="fsheet__group" type="button" role="tab"
                  id={`fsheet-tab-${group}`} aria-controls="fsheet-items"
                  aria-selected={sheetGroup === i} onClick={() => setSheetGroup(i)}
                >
                  {GROUP_LABEL[group]}
                  {/* 고른 개수 — 다른 칸으로 옮겨도 무엇을 골라 뒀는지 보입니다
                      (사이드바 묶음·필터 버튼과 같은 배지) (2026-08-12, 디자인 요청) */}
                  {picked[group].length > 0 ? (
                    <span className="fsheet__group-count">
                      {picked[group].length}
                      <span className="sr-only">개 선택됨</span>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <div
              className="fsheet__items" id="fsheet-items" role="tabpanel"
              aria-labelledby={`fsheet-tab-${FILTER_GROUPS[sheetGroup].group}`}
            >
              {(() => {
                const { group, values, suffix = '' } = FILTER_GROUPS[sheetGroup];
                const chosen = picked[group];
                return (
                  <>
                    {/* '전체'는 그룹 안 선택을 모두 지웁니다 */}
                    <button
                      className="fsheet__item" type="button"
                      aria-pressed={chosen.length === 0}
                      onClick={() => setPicked((p) => ({ ...p, [group]: [] }))}
                    >
                      전체
                    </button>
                    {values.map((v) => (
                      <button
                        key={v} className="fsheet__item" type="button"
                        aria-pressed={chosen.includes(v)} onClick={() => toggle(group, v)}
                      >
                        {v}{suffix} <span className="num">{countOf(group, v)}</span>
                      </button>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="fsheet__foot">
            <button className="btn btn--ghost btn--sm" type="button" onClick={resetAll}>
              초기화
              <svg className="btn__ico" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn btn--primary btn--sm" type="button" onClick={() => setFilterOpen(false)}>
              확인
            </button>
          </div>
        </div>
      </div>

      <CartBar />
      {/* 이미 수강신청 화면이라 갈 곳이 없습니다 — 링크로 두면 고른 과목만 지웁니다 */}
      <FloatingBanner href={null} />
      <ScrollTopButton />
    </>
  );
}
