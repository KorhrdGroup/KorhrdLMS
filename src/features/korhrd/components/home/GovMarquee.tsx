/**
 * 주무부처 로고 띠 — 가로로 끊김 없이 흘러갑니다.
 *
 * 같은 목록을 두 벌 이어 붙이고 CSS(.gov-marquee__track.is-rolling)가 -50% 까지 밀어
 * 무한 루프처럼 보이게 합니다. 사본은 보조기기에 중복 노출되지 않도록 aria-hidden 입니다.
 * 부처를 추가하려면 MINISTRIES 에만 넣으면 됩니다 (public/ministry-logo/{이름}-white.svg 필요).
 */
const MINISTRIES = [
  '교육부', '보건복지부', '문화체육관광부', '여성가족부', '법무부', '환경부',
  '산업통상부', '식품의약품안전처', '과학기술정보통신부', '농림축산식품부',
  '산림청', '행정안전부', '국토교통부', '중소벤처기업부', '질병관리청', '경찰청',
];

export default function GovMarquee() {
  const row = (hidden: boolean) => (
    <ul className="gov-row" aria-hidden={hidden || undefined}>
      {MINISTRIES.map((m) => (
        <li key={m}>
          <img src={`/ministry-logo/${encodeURIComponent(m)}-white.svg`} alt={hidden ? '' : m} loading="lazy" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="gov-block">
      <div className="gov-marquee">
        <div className="gov-marquee__track is-rolling">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
