import Link from "next/link";

/**
 * 404 본문.
 * 프로토타입 원본: korhrd-site/404.html (.errpage — appendix.css)
 *
 * 라우트 그룹 안(`(korhrd)/not-found.tsx`)과 밖(`app/not-found.tsx`) 두 곳에서
 * 같은 화면을 써야 해서 본문만 떼어두었습니다.
 */
export default function NotFoundContent() {
  return (
    <div className="container">
      <section className="errpage">
        <p className="errpage__code" aria-hidden="true">404</p>
        <h1 className="errpage__title">페이지를 찾을 수 없습니다</h1>
        <p className="errpage__desc">
          요청하신 페이지가 이동되었거나 삭제되어 표시할 수 없습니다.
          <br />
          주소가 정확한지 확인해 주시거나, 아래 버튼으로 이동해 주세요.
        </p>
        <p className="errpage__actions">
          <Link className="btn btn--primary" href="/">홈으로</Link>
          <Link className="btn btn--ghost" href="/courses">수강신청 둘러보기</Link>
        </p>
        <p className="errpage__links">
          <Link href="/jobs">취업 길찾기</Link>
          <Link href="/reviews">합격후기</Link>
          <Link href="/support">공지사항</Link>
          <Link href="/support">고객센터</Link>
        </p>
      </section>
    </div>
  );
}
