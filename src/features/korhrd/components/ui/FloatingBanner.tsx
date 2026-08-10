import Image from 'next/image';
import Link from 'next/link';
import styles from './FloatingBanner.module.css';

/**
 * 화면 오른쪽 끝에 붙는 플로팅 배너 — Figma floating_banner (334:9614)
 * https://figma.com/design/jIRU9Nf4klrKpzgtdhW3br?node-id=334-9614
 *
 * 메인·수강신청에서만 씁니다. 본문 옆 여백이 배너를 담을 만큼 넓을 때만
 * 보이고, 그보다 좁으면 본문을 덮어서 CSS가 감춥니다.
 *
 * 색은 전부 사이트 토큰과 맞아떨어집니다 —
 * 시안의 #E5EDFF=--blue-soft, #00376E=--navy, #1D1D1D=--ink-2.
 * 글꼴만 시안(Paperlogy)이 아니라 사이트 본문 글꼴(Pretendard)을 씁니다.
 */
export default function FloatingBanner({ href = '/courses' }: {
  /**
   * 누르면 갈 곳. 수강신청 화면처럼 이미 그 자리에 있으면 null 을 넘겨
   * 링크를 빼 주세요 — 자기 페이지로 가는 링크는 고른 과목만 지웁니다.
   */
  href?: string | null;
}) {
  const body = (
    <>
      <Image
        className={styles.image} src="/floating-trophy.png" alt=""
        width={44} height={44}
      />
      <span className={styles.text}>
        2026년<br />최신강의<br />업데이트 중!
      </span>
      {/* 진행 막대는 장식입니다 — 실제 진행률이 아니라 '갱신 중'이라는 느낌만 줍니다 */}
      <span className={styles.bar} aria-hidden="true"><span /></span>
    </>
  );

  return (
    <aside className={styles.banner} aria-label="2026년 최신강의 업데이트 안내">
      {href ? (
        /* 배너 전체가 하나의 링크입니다 — 안내만 하고 갈 곳이 없으면
           눌러도 아무 일이 없어 고장으로 보입니다 */
        <Link className={`${styles.body} ${styles.link}`} href={href}>{body}</Link>
      ) : (
        <div className={styles.body}>{body}</div>
      )}
    </aside>
  );
}
