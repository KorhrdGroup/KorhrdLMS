import Link from 'next/link';

import SupportNav from './SupportNav';

/**
 * 고객센터 묶음 — 공지사항 · 자주 묻는 질문 · 취득 과정 · 1:1 문의.
 *
 * 네 화면이 머리말(제목·상담 3블록)과 왼쪽 메뉴를 함께 쓰므로 레이아웃에 둡니다.
 * 각 화면은 오른쪽 칸의 내용만 그립니다 (2026-08-12, 디자인 요청).
 *
 * 상담 3블록을 여기 둔 것은 어느 화면에서 헤매다 들어와도 전화·카카오로 바로
 * 갈 수 있어야 하기 때문입니다 — 전달본 support.html 도 맨 위에 두고 있습니다.
 */
export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li><Link href="/">홈</Link></li>
          <li aria-current="page">고객센터</li>
        </ol>
      </nav>

      <div className="page-head"><h1>고객센터</h1></div>

      <div className="support-grid">
        <div className="tel-box">
          <p className="tel-box__q">궁금한 점이 있으신가요?</p>
          <p className="tel-box__t">전화 상담 문의</p>
          <p className="tel-box__n"><a href="tel:0221359249">02-2135-9249</a></p>
          <p className="tel-box__h">
            운영시간 평일 10:00~18:00<br />
            점심시간 12:00~14:00 · 금/토/일/공휴일 휴무
          </p>
        </div>

        {/* 실시간 카카오톡 상담 배너 (Figma card_cs) */}
        <a className="kakao-box" href="https://pf.kakao.com/_NHfxfb" target="_blank" rel="noopener">
          <span className="kakao-box__txt">
            <span className="kakao-box__q">통화가 어려우신가요?</span>
            <span className="kakao-box__t">실시간 카카오톡 상담</span>
          </span>
          <span className="kakao-box__ico" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kakao-bubble.png" alt="" />
          </span>
        </a>

        <Link className="support-card" href="/support/qna">
          <span className="ph ph--icon" aria-hidden="true" />
          <b>1:1 문의</b>
          <span>남겨주시면 순차적으로 답변드립니다</span>
        </Link>
      </div>

      {/* 자격증 발급신청·나의 강의실이 쓰는 것과 같은 좌측 메뉴 짜임입니다 */}
      <div className="layout-side mt-5">
        <aside>
          <SupportNav />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
