'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logoutStudentAction } from '@/features/auth/actions/student-login.actions';
import { useAuth } from '@/features/korhrd/lib/useAuth';
import SearchOverlay from './SearchOverlay';

/** GNB 메뉴 — data-requires-login 인 항목은 비로그인 시 로그인으로 유도합니다 */
const NAV = [
  { href: '/jobs', label: '취업 길찾기' },
  { href: '/courses', label: '수강신청' },
  { href: '/mylecture', label: '나의 강의실', requiresLogin: true },
  { href: '/certificate', label: '자격증 발급신청', requiresLogin: true },
  { href: '/reviews', label: '합격후기' },
  { href: '/notice', label: '공지사항' },
];

/**
 * 상단 고정 헤더.
 *
 * 동작 규칙 (프로토타입 initNavToggle · initStickyHeader 를 옮긴 것)
 *  - 1100px 이하: 햄버거 패널로 전환 (그 위 폭에서는 메뉴가 두 줄로 깨집니다)
 *  - 스크롤을 시작하면 그림자(.is-stuck)
 *  - 모바일(560px 이하)에서 아래로 스크롤하면 숨김(.is-hidden), 위로 올리면 표시
 *    · 맨 위 근처(헤더 높이 이내)에서는 항상 표시 — 숨은 채로 남으면 흰 띠가 보입니다
 *    · 메뉴 패널이 열려 있으면 숨기지 않습니다
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, userName } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);

  /* 라우트가 바뀌면 열려 있던 패널을 닫습니다 */
  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = headerRef.current?.offsetHeight ?? 56;
      setStuck(y > 4);

      if (y <= h) {
        setHidden(false);
      } else if (!navOpen && Math.abs(y - lastY.current) > 4) {
        setHidden(y > lastY.current);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [navOpen]);

  /* 로그인한 뒤 어디로 돌려보낼지.
     로그인·회원가입·계정찾기 자신은 돌아갈 자리가 아닙니다 — 그대로 두면
     로그인을 마치고 다시 로그인 화면에 떨어집니다. 이때는 redirect 를 붙이지
     않고 서버 액션의 기본값(/mylecture)에 맡깁니다. */
  const AUTH_PATHS = ['/login', '/signup', '/find', '/find-account', '/logout'];
  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const loginFor = (target: string) =>
    `/login?redirect=${encodeURIComponent(target)}`;
  const loginHref = isAuthPath ? '/login' : loginFor(pathname);

  /* 클릭하는 순간의 주소로 다시 만듭니다 — 서버에서 그릴 때는 usePathname 만
     알 수 있어 물음표 뒤(?cat=..·?g=..)가 빠집니다. window.location 은 라우터를
     거치지 않는 history.replaceState(취업 길찾기 직업군 전환)까지 그대로 담습니다.
     자바스크립트가 없으면 위 href 로 넘어가 경로만 돌아갑니다. */
  const goLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthPath || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    const here = window.location.pathname + window.location.search;
    router.push(loginFor(here));
  };

  return (
    <>
      <header
        ref={headerRef}
        className={['header', stuck && 'is-stuck', hidden && 'is-hidden'].filter(Boolean).join(' ')}
      >
        <div className="header__in">
          <Link className="logo" href="/">
            <img src="/logo.svg" alt="한평생 직업훈련" width={147} height={18} />
          </Link>

          <button
            className="nav-toggle"
            type="button"
            aria-expanded={navOpen}
            aria-controls="gnb"
            aria-label={navOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setNavOpen((v) => !v)}
          >
            ☰
          </button>

          <div className={['header__nav', navOpen && 'is-open'].filter(Boolean).join(' ')}>
            <nav className="gnb" id="gnb" aria-label="주 메뉴">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.requiresLogin && !isLoggedIn ? loginFor(item.href) : item.href}
                  aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="header__util">
              <button
                className="search-trigger"
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSearchOpen(true)}
              >
                <span className="txt">자격증 검색</span>
                <span className="ico" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </button>

              <span className="header__auth">
                {isLoggedIn ? (
                  <>
                    <Link className="util-link util-link--strong" href="/mylecture?tab=mypage">
                      {userName} 님
                    </Link>
                    {/* 로그아웃은 폼 제출로 합니다. 서버 액션을 코드에서 호출하면
                        액션 안의 redirect가 라우터를 타지 못해 세션이 남습니다.
                        (같은 방식이 src/components/home/Hero.tsx 에서 이미 동작 중) */}
                    <form action={logoutStudentAction} style={{ display: 'inline' }}>
                      <button className="util-link" type="submit">로그아웃</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link className="util-link util-link--login" href={loginHref} onClick={goLogin}>
                      로그인
                    </Link>
                    <Link className="util-link util-link--join" href="/signup">
                      회원가입
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
