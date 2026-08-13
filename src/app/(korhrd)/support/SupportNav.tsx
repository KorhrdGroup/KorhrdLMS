'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * 고객센터 왼쪽 메뉴.
 *
 * 지금 보고 있는 항목을 표시하려면 주소를 알아야 해서 클라이언트 컴포넌트입니다
 * (레이아웃은 주소를 읽을 수 없습니다 — Next 문서의 layouts-and-pages 참고).
 * 모양은 자격증 발급신청·나의 강의실이 쓰는 .side-nav__item 그대로입니다.
 */
const ITEMS = [
  { href: '/support', label: '공지사항' },
  { href: '/support/faq', label: '자주 묻는 질문' },
  { href: '/support/process', label: '취득 과정' },
  { href: '/support/qna', label: '1:1 문의' },
];

export default function SupportNav() {
  const pathname = usePathname();

  return (
    /* support-nav — 좁은 화면에서 탭 격자로 바뀝니다 (overrides.css) */
    <nav className="filter-group support-nav" aria-label="고객센터 메뉴">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          className="side-nav__item"
          href={item.href}
          /* '/support' 는 정확히 같을 때만 — 그러지 않으면 하위 화면에서도 켜집니다 */
          aria-current={pathname === item.href ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
