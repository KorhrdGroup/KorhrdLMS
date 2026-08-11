'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COURSES } from '@/features/korhrd/data/courses';
import { PRIVATE_CERT_TOP5, popularNameKey } from '@/features/korhrd/data/popular-top5';

/* 인기 자격증 초기값(하드코딩) — 과정 데이터의 인기 순위(rank, 1이 1위).
   실제 순위는 /api/popular-courses(수강신청 수 집계)가 내려주고,
   초반처럼 신청 데이터가 10개를 못 채우면 이 목록으로 나머지를 채웁니다.
   (추후 검색횟수 기반으로 바꿀 때는 API 집계만 갈아끼우면 됩니다.) */
const POPULAR_FALLBACK = [...COURSES]
  .filter((c) => c.rank > 0)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 10)
  .map((c) => c.n);

/** 상위 5개는 운영 지정(민간자격증 Top5)으로 고정하고, 나머지만 데이터로 채웁니다. */
function buildPopular(dynamicNames: string[]): string[] {
  const pinnedKeys = new Set(PRIVATE_CERT_TOP5.map(popularNameKey));
  const rest = [...dynamicNames, ...POPULAR_FALLBACK].filter(
    (name, i, arr) =>
      !pinnedKeys.has(popularNameKey(name)) &&
      arr.findIndex((v) => popularNameKey(v) === popularNameKey(name)) === i,
  );
  return [...PRIVATE_CERT_TOP5, ...rest].slice(0, 10);
}

/** 최근 검색어 — 브라우저에만 저장합니다(localStorage). 서버로 보내지 않습니다. */
const RECENT_KEY = 'korhrd-recent-searches';
const RECENT_MAX = 10;

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* 시크릿 모드 등 저장 불가 환경은 조용히 넘어갑니다 */
  }
}

/** 전체화면 검색 — 헤더의 "자격증 검색"으로 열립니다 */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>(() => buildPopular([]));
  const inputRef = useRef<HTMLInputElement>(null);

  /** 검색어를 최근 목록 맨 앞에 저장합니다(중복은 앞으로 끌어올림). */
  const remember = (term: string) => {
    const key = term.trim();
    if (!key) return;
    setRecent((prev) => {
      const next = [key, ...prev.filter((v) => v !== key)].slice(0, RECENT_MAX);
      saveRecent(next);
      return next;
    });
  };

  const removeRecent = (term: string) => {
    setRecent((prev) => {
      const next = prev.filter((v) => v !== term);
      saveRecent(next);
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;
    setQ('');
    setRecent(loadRecent());
    // 실제 수강신청 수 순위를 얹습니다 — 부족한 자리는 하드코딩으로 채우고, 실패해도 하드코딩 그대로.
    fetch('/api/popular-courses')
      .then((res) => (res.ok ? res.json() : { names: [] }))
      .then(({ names }: { names: string[] }) => {
        if (!Array.isArray(names) || names.length === 0) return;
        setPopular(buildPopular(names));
      })
      .catch(() => {});
    inputRef.current?.focus();
    document.body.classList.add('is-locked');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  /* 분야별로 묶어서 보여줍니다 */
  const groups = useMemo(() => {
    const key = q.trim();
    if (!key) return null;
    const map = new Map<string, string[]>();
    COURSES.filter((c) => c.n.includes(key)).forEach((c) => {
      const cat = c.c[0] ?? '기타';
      map.set(cat, [...(map.get(cat) ?? []), c.n]);
    });
    return map;
  }, [q]);

  return (
    <div className={['search-overlay', open && 'is-open'].filter(Boolean).join(' ')}
         role="dialog" aria-modal="true" aria-label="자격증 검색">
      <div className="search-overlay__dim" onClick={onClose} />
      <div className="search-overlay__panel">
        <div className="search-overlay__bar">
          <span className="logo">
            <img src="/logo.svg" alt="한평생 직업훈련" width={147} height={18} />
          </span>
          <form
            className="search-field" action="/courses" method="get" role="search"
            onSubmit={() => remember(q)}
          >
            <label className="sr-only" htmlFor="search-input">자격증 검색</label>
            <input
              id="search-input" name="q" type="search" autoComplete="off" ref={inputRef}
              placeholder="어떤 자격증이 궁금하신가요?"
              value={q} onChange={(e) => setQ(e.target.value)}
            />
            {/* 입력이 있을 때만 보입니다. type=search 의 브라우저 기본 ✕는 CSS에서 숨겼습니다 */}
            <button type="button" aria-label="입력 지우기" hidden={q.length === 0} onClick={() => setQ('')}>
              ✕
            </button>
            <button type="submit" className="submit" aria-label="검색">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>

        <div className="search-overlay__body">
          {!groups ? (
            <div className="search-panel">
              <div className="search-cols">
                <div>
                  <h2>인기 자격증 <em>TOP 10</em></h2>
                  <ol className="rank-list">
                    {popular.map((name, i) => (
                      <li key={name}>
                        <span className="no">{i + 1}</span>
                        <Link href={`/courses/${encodeURIComponent(name)}`}>{name}</Link>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h2>최근 검색어</h2>
                  <ul className="recent-list">
                    {recent.length === 0 ? (
                      <li><span className="empty">최근 검색어가 없습니다</span></li>
                    ) : (
                      recent.map((term) => (
                        <li key={term} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* 누르면 그 검색어로 바로 검색합니다 */}
                          <button
                            type="button"
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                            onClick={() => { setQ(term); inputRef.current?.focus(); }}
                          >
                            {term}
                          </button>
                          <button
                            type="button" aria-label={`${term} 삭제`}
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--faint, #999)', fontSize: 12 }}
                            onClick={() => removeRecent(term)}
                          >
                            ✕
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="search-panel">
              {groups.size === 0 ? (
                <p className="empty-state">
                  <strong>‘{q}’ 검색 결과가 없습니다</strong>
                  다른 검색어를 입력하시거나 전체 과정에서 찾아보세요.
                </p>
              ) : (
                [...groups].map(([cat, names]) => (
                  <section className="search-group" key={cat}>
                    <h2>{cat}</h2>
                    <ul>
                      {names.map((n) => (
                        <li key={n}>
                          <Link href={`/courses/${encodeURIComponent(n)}`} onClick={() => remember(q)}>
                            {n.split(q).map((part, i, arr) => (
                              <span key={i}>{part}{i < arr.length - 1 && <mark>{q}</mark>}</span>
                            ))}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </div>
          )}
        </div>

        <button className="search-overlay__close" type="button" aria-label="검색 닫기" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}
