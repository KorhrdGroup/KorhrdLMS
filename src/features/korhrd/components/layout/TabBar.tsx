'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** 하단 고정 탭바 — Figma tabbar 351:10964 */
const ITEMS = [
  { ico: 'phone', label: '전화상담', href: 'tel:0221359249' },
  { ico: 'book', label: '수강신청', href: '/courses' },
  { ico: 'thumb', label: '합격후기', href: '/reviews' },
];

/**
 * 메인(/) · 980px 이하에서만 보입니다.
 * 다른 화면은 목적이 뚜렷해 필요 없다고 판단해 제외했습니다.
 * 높이는 상단 헤더와 같은 --header-h 를 씁니다.
 */
export default function TabBar() {
  const pathname = usePathname();
  const show = pathname === '/';

  /* 탭바에 마지막 내용이 가리지 않도록 본문 아래 여백을 확보합니다 */
  useEffect(() => {
    document.body.classList.toggle('has-tabbar', show);
    return () => document.body.classList.remove('has-tabbar');
  }, [show]);

  if (!show) return null;

  return (
    <nav className="tabbar" aria-label="바로가기">
      {ITEMS.map((it) => (
        <Link className="tabbar__item" href={it.href} key={it.label}>
          <img src={`/tabbar/${it.ico}.svg`} alt="" width={21} height={21} />
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
