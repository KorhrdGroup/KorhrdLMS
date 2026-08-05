'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COURSES } from '@/features/korhrd/data/courses';

const POPULAR = [
  '병원동행매니저', '간병사', '노인돌봄생활지원사', '베이비시터', '산후관리사',
  '병원코디네이터', '학교안전지도사', '심리상담사 1급', '노인심리상담사 1급', '집합건물관리사',
];

/** 전체화면 검색 — 헤더의 "자격증 검색"으로 열립니다 */
export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ('');
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
          <form className="search-field" action="/courses" method="get" role="search">
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
                    {POPULAR.map((name, i) => (
                      <li key={name}>
                        <span className="no">{i + 1}</span>
                        <Link href={`/courses/${encodeURIComponent(name)}`}>{name}</Link>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h2>최근 검색어</h2>
                  {/* TODO: localStorage 등으로 실제 검색 기록 연결 */}
                  <ul className="recent-list">
                    <li><span className="empty">최근 검색어가 없습니다</span></li>
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
                          <Link href={`/courses/${encodeURIComponent(n)}`}>
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
