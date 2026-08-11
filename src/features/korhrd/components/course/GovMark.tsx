/**
 * 주무부처 로고.
 * 파일은 public/ministry-logo/{파일명}-white.svg · {파일명}-black.svg 입니다.
 * 매핑에 없는 부처는 로고 대신 부처명을 글자로 보여줍니다.
 */

/** 파일명이 곧 부처명인 것들 */
const MINISTRIES = [
  '교육부', '보건복지부', '문화체육관광부', '여성가족부', '법무부', '환경부',
  '식품의약품안전처', '과학기술정보통신부', '농림축산식품부', '산림청', '산업통상부',
  '행정안전부', '국토교통부', '중소벤처기업부', '질병관리청', '경찰청',
];

/**
 * 표기가 파일명과 다른 과정들.
 *
 * 데이터의 부처명은 운영 사이트(korhrd.co.kr) 표기를 그대로 옮긴 것이라
 * 정식 명칭과 다른 경우가 있습니다. 화면에 보이는 글자는 그대로 두고
 * 로고만 같은 부처 것을 쓰도록 이어 줍니다.
 * 과정 상세도 같은 방식입니다(course-detail/constants.ts MINISTRY_LOGO_SLUG).
 */
const ALIAS: Record<string, string> = {
  중소기업벤처부: '중소벤처기업부',
  질병관리부: '질병관리청',
  식품의약품안전처부: '식품의약품안전처',
  산업통상자원부: '산업통상부',      // 가진 로고가 '산업통상부' 한 벌뿐입니다
  '교육부/고용노동부': '교육부',      // 두 부처 공동 소관 — 상세와 같이 교육부 로고
};

export default function GovMark({ ministry, tone = 'white' }: { ministry: string; tone?: 'white' | 'black' }) {
  const file = ALIAS[ministry] ?? (MINISTRIES.includes(ministry) ? ministry : null);

  return (
    <span className="gov-mark">
      {file ? (
        /* 폭·높이를 박지 않습니다 — 부처마다 로고 비율이 2.49~3.26으로 제각각이라
           고정값을 주면 로드 전에 엉뚱한 폭으로 잡힙니다. 크기는 .gov-mark img 가
           height:26px · width:auto 로 정합니다 (course.css). */
        <img
          src={`/ministry-logo/${encodeURIComponent(file)}-${tone}.svg`}
          alt={ministry} loading="lazy"
        />
      ) : (
        <span>{ministry}</span>
      )}
    </span>
  );
}
