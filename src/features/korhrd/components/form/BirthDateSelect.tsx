'use client';

import { useEffect, useState } from 'react';

/**
 * 생년월일 입력 — 연 · 월 · 일 세 칸.
 *
 * 달력 입력(type="date")은 태어난 해까지 달을 몇십 번 넘겨야 해서 세 칸으로
 * 나눴습니다 (2026-08-12, 디자인 요청). 값은 예전과 같은 'YYYY-MM-DD' 한 줄로
 * 주고받으므로 서버·DB 쪽은 그대로입니다.
 *
 * 고른 조각(연도만 고른 상태 등)은 여기서 기억합니다 — 부모에게는 세 칸이
 * 다 모였을 때만 완성된 날짜를 올리고, 하나라도 비면 빈 값을 올립니다.
 * (전에는 부모가 돌려주는 값으로만 그려서, 연도 하나를 고르면 빈 값이 되어
 *  선택이 즉시 풀렸습니다 — 2026-08-19 "생년월일 설정이 안 된다" 문의)
 *
 * 자격증에 인쇄되는 값이라 자격증 발급신청과 마이페이지 두 곳에서 같은 것을
 * 받습니다 — 그래서 컴포넌트로 빼 두었습니다.
 */

/** 두 자리로 맞춥니다 — 나가는 값이 'YYYY-MM-DD' 여야 합니다 */
const pad2 = (n: number) => String(n).padStart(2, '0');

/** 그 달의 마지막 날. 0일은 전달의 마지막 날이라 윤년도 자동으로 맞습니다 */
const lastDayOf = (year: string, month: string) =>
  year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;

const MONTHS = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

/* 고를 수 있는 연도 — 올해부터 100년 전까지 최신순입니다.
   수강생 연령대가 넓어(시니어 과정이 많습니다) 범위를 넉넉히 둡니다. */
const THIS_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 101 }, (_, i) => String(THIS_YEAR - i));

export default function BirthDateSelect({
  id,
  value,
  onChange,
  required = false,
}: {
  /** 라벨이 가리키는 id — 첫 칸(연도)에 붙습니다 */
  id: string;
  /** 'YYYY-MM-DD' 또는 빈 문자열 */
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
}) {
  const [year, setYear] = useState(value.slice(0, 4));
  const [month, setMonth] = useState(value.slice(5, 7));
  const [day, setDay] = useState(value.slice(8, 10));

  /* 부모가 완성된 값을 새로 내려주면(프로필 로드 등) 그걸 따라갑니다.
     빈 값은 "아직 고르는 중"과 구분할 수 없어 조각을 지우지 않습니다. */
  useEffect(() => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setYear(value.slice(0, 4));
      setMonth(value.slice(5, 7));
      setDay(value.slice(8, 10));
    }
  }, [value]);

  /** 세 조각이 다 모였을 때만 완성된 날짜를 올립니다 */
  const apply = (y: string, m: string, d: string) => {
    setYear(y);
    setMonth(m);
    setDay(d);
    onChange(y && m && d ? `${y}-${m}-${d}` : '');
  };

  /* 2월로 옮겼는데 31일이 남아 있거나, 2월 29일을 골라 둔 채 평년으로 옮기면
     없는 날짜가 됩니다. 그 달의 마지막 날로 당깁니다. */
  const clampDay = (y: string, m: string) => {
    const last = lastDayOf(y, m);
    return day && Number(day) > last ? pad2(last) : day;
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {/* 연도가 네 자리라 넓게(1.4), 월·일은 두 자리라 좁게 나눕니다 */}
      <select
        id={id} required={required} aria-label="태어난 해" style={{ flex: 1.4 }}
        value={year}
        onChange={(event) => apply(event.target.value, month, clampDay(event.target.value, month))}
      >
        <option value="">연도</option>
        {BIRTH_YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
      </select>

      <select
        required={required} aria-label="태어난 달" style={{ flex: 1 }}
        value={month}
        onChange={(event) => apply(year, event.target.value, clampDay(year, event.target.value))}
      >
        <option value="">월</option>
        {MONTHS.map((m) => <option key={m} value={m}>{Number(m)}월</option>)}
      </select>

      <select
        required={required} aria-label="태어난 날" style={{ flex: 1 }}
        value={day}
        onChange={(event) => apply(year, month, event.target.value)}
      >
        <option value="">일</option>
        {Array.from({ length: lastDayOf(year, month) }, (_, i) => pad2(i + 1))
          .map((d) => <option key={d} value={d}>{Number(d)}일</option>)}
      </select>
    </div>
  );
}
