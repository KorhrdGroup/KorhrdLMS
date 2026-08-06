
/**
 * 주무부처 로고.
 * public/ministry-logo/{부처명}.svg · {부처명}-white.svg 가 있어야 합니다.
 * 파일이 없는 부처는 텍스트로 대체하세요 (아래 MINISTRIES 목록 참고).
 */
const MINISTRIES = [
  '교육부', '보건복지부', '문화체육관광부', '여성가족부', '법무부', '환경부',
  '식품의약품안전처', '과학기술정보통신부', '농림축산식품부', '산림청', '산업통상부',
  '행정안전부', '국토교통부', '중소벤처기업부', '질병관리청', '경찰청',
];

export default function GovMark({ ministry, tone = 'white' }: { ministry: string; tone?: 'white' | 'black' }) {
  const hasLogo = MINISTRIES.includes(ministry);
  return (
    <span className="gov-mark">
      {hasLogo ? (
        /* 폭·높이를 박지 않습니다 — 부처마다 로고 비율이 2.49~3.26으로 제각각이라
           고정값을 주면 로드 전에 엉뚱한 폭으로 잡힙니다. 크기는 .gov-mark img 가
           height:26px · width:auto 로 정합니다 (course.css). */
        <img
          src={`/ministry-logo/${encodeURIComponent(ministry)}${tone === 'white' ? '-white' : ''}.svg`}
          alt={ministry} loading="lazy"
        />
      ) : (
        <span>{ministry}</span>
      )}
    </span>
  );
}
