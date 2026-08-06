'use client';

import { useState } from 'react';

/**
 * 우편번호 검색 — 카카오(다음) 우편번호 서비스.
 * https://postcode.map.kakao.com/guide
 *
 * 스크립트는 **버튼을 누를 때 한 번만** 불러옵니다. 모든 화면에서 미리 받으면
 * 쓰지도 않는 스크립트로 첫 화면이 느려집니다.
 * 별도 키·가입이 필요 없는 무료 서비스입니다.
 */
const SCRIPT_SRC = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

type DaumPostcodeResult = {
  /** 5자리 우편번호 */
  zonecode: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 지번 주소 */
  jibunAddress: string;
  /** 사용자가 고른 주소 타입 (R: 도로명, J: 지번) */
  userSelectedType: 'R' | 'J';
  /** 참고항목(건물명 등) */
  buildingName: string;
  apartment: 'Y' | 'N';
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
        onclose?: () => void;
      }) => { open: () => void };
    };
  }
}

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.daum?.Postcode) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('script error')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script error'));
    document.head.appendChild(script);
  });
}

export default function PostcodeButton({
  onSelect,
  className = 'btn btn--ghost',
}: {
  /** 우편번호와 주소를 함께 돌려줍니다. 상세주소는 사용자가 직접 입력합니다. */
  onSelect: (value: { postalCode: string; address: string }) => void;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const open = async () => {
    setFailed(false);
    setLoading(true);
    try {
      await loadScript();
      if (!window.daum?.Postcode) throw new Error('unavailable');

      new window.daum.Postcode({
        oncomplete: (data) => {
          // 사용자가 고른 방식(도로명/지번)의 주소를 씁니다.
          const base = data.userSelectedType === 'J' ? data.jibunAddress : data.roadAddress;
          // 아파트 등 건물명이 있으면 괄호로 덧붙입니다(우편번호 서비스 권장 표기).
          const extra =
            data.userSelectedType === 'R' && data.buildingName && data.apartment === 'Y'
              ? ` (${data.buildingName})`
              : '';
          onSelect({ postalCode: data.zonecode, address: base + extra });
        },
      }).open();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={open}
        disabled={loading}
        style={{ whiteSpace: 'nowrap' }}
      >
        {loading ? '여는 중…' : '우편번호 검색'}
      </button>
      {failed ? (
        <p className="my-card__status my-card__status--fail">
          우편번호 검색을 열지 못했습니다. 주소를 직접 입력해 주세요.
        </p>
      ) : null}
    </>
  );
}
