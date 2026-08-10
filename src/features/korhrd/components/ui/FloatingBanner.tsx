import Image from 'next/image';
import styles from './FloatingBanner.module.css';

/**
 * 화면 오른쪽 끝에 붙는 띠 배너 — Figma floating_banner (334:9614)
 * https://figma.com/design/jIRU9Nf4klrKpzgtdhW3br?node-id=334-9614
 *
 * 메인·수강신청에서만 씁니다. 데스크톱(1200px 이상)에서만 보이고, 그보다
 * 좁으면 본문을 덮어서 CSS가 감춥니다.
 *
 * 색은 전부 사이트 토큰과 맞아떨어집니다 —
 * 시안의 #E5EDFF=--blue-soft, #00376E=--navy, #1D1D1D=--ink-2.
 * 글꼴만 시안(Paperlogy)이 아니라 사이트 본문 글꼴(Pretendard)을 씁니다.
 */
export default function FloatingBanner() {
  return (
    <aside className={styles.banner} aria-label="2026년 최신강의 업데이트 안내">
      <Image
        className={styles.image} src="/floating-trophy.png" alt=""
        width={44} height={44}
      />
      <p className={styles.text}>
        2026년<br />최신강의<br />업데이트 중!
      </p>
      {/* 진행 막대는 장식입니다 — 실제 진행률이 아니라 '갱신 중'이라는 느낌만 줍니다 */}
      <span className={styles.bar} aria-hidden="true"><span /></span>
    </aside>
  );
}
