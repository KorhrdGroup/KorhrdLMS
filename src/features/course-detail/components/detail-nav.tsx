"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * 과정 상세의 상단 메뉴 + 햄버거 버튼.
 * 프로토타입 원본: korhrd-site/course-detail.html 헤더 + main.js 의 initNav()
 *
 * 옮겨오면서 햄버거 버튼이 빠져 있었습니다. style.css 는 980px 이하에서
 * `.gnb{display:none}` 으로 메뉴를 감추고 `.nav-toggle{display:block}` 으로
 * 버튼을 내보내는데, 버튼이 아예 없어서 좁은 화면에서는 메뉴에 접근할
 * 방법이 없었습니다.
 *
 * 여는 방식은 이 번들 CSS 에 맞춥니다 — `.gnb.is-open{display:flex}` 이므로
 * is-open 은 .gnb 에 붙입니다(.header__nav 에는 규칙이 없습니다).
 * 원본과 같이 바깥 클릭·Esc 로도 닫습니다.
 */
export function DetailNav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (toggleRef.current?.contains(target) || navRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        className="nav-toggle" type="button"
        aria-expanded={open} aria-controls="gnb"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        onClick={() => setOpen((prev) => !prev)}
      >
        ☰
      </button>
      <nav
        ref={navRef}
        className={open ? "gnb is-open" : "gnb"} id="gnb" aria-label="주 메뉴"
      >
        <Link href="/jobs">취업 길찾기</Link>
        <Link href="/courses" aria-current="page">수강신청</Link>
        <Link href="/mylecture">나의 강의실</Link>
        <Link href="/certificate">자격증 발급신청</Link>
        <Link href="/reviews">합격후기</Link>
        <Link href="/notice">공지사항</Link>
      </nav>
    </>
  );
}
