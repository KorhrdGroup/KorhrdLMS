'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { trackKarrotEvent } from '@/lib/karrot-pixel.client';
import { createPortal } from 'react-dom';

/**
 * 수강신청 결과 모달.
 * 프로토타입 원본: assets/js/main.js 의 initEnroll() — 마크업·클래스를 그대로 옮겼습니다.
 *
 * 원본은 "신청 완료" 한 가지만 다뤘지만, 실제로는 **이미 신청한 과정**을 다시
 * 담는 경우가 흔합니다. 그때 아무것도 안 뜨면 버튼이 고장 난 것처럼 보여서
 * 같은 모달로 "이미 수강신청된 항목입니다"를 알려줍니다.
 *
 * 원본 동작도 함께 가져왔습니다.
 *  · 열리면 body에 .is-locked (뒤 배경 스크롤 잠금)
 *  · Esc로 닫힘, 열릴 때 기본 버튼에 포커스
 *  · 닫으면 열기 전 눌렀던 곳으로 포커스 복귀
 *
 * ⚠ 반드시 body 에 포털로 붙입니다(원본도 document.body.appendChild).
 * 장바구니 바 안에 그리면 `.cart-bar.is-empty { display:none }` 때문에
 * 신청 직후 바가 사라질 때 모달까지 같이 숨습니다 — 실제로 그렇게 안 보였습니다.
 */
export type EnrollResult = {
  /** 이번에 새로 신청된 과정명 */
  applied: string[];
  /** 이미 신청되어 있던 과정명 */
  duplicated: string[];
};

/** "‘A’ 과정이" / "‘A’ 외 2개 과정이" — 원본 문구 규칙 */
function subject(courses: string[]) {
  return courses.length === 1
    ? `‘${courses[0]}’ 과정이`
    : `‘${courses[0]}’ 외 ${courses.length - 1}개 과정이`;
}

export default function EnrollDoneModal({
  result,
  onClose,
}: {
  result: EnrollResult | null;
  onClose: () => void;
}) {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const lastFocused = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);
  const open = result !== null;

  // 포털 대상(document.body)은 클라이언트에서만 있습니다.
  useEffect(() => setMounted(true), []);

  /* 당근 전환 추적 — 실제로 새 수강신청이 이뤄졌을 때만 보냅니다 */
  const isNewApplied = (result?.applied.length ?? 0) > 0;
  useEffect(() => {
    if (isNewApplied) trackKarrotEvent('SubmitApplication');
  }, [isNewApplied]);

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement;
    document.body.classList.add('is-locked');
    primaryRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      (lastFocused.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!result || !mounted) return null;

  const { applied, duplicated } = result;
  const isNew = applied.length > 0;

  return createPortal(
    <div className="modal is-open" role="dialog" aria-modal="true" aria-label="수강신청 결과">
      <div className="modal__dim" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__result">
          <span className="mark" aria-hidden="true">✓</span>
          <h2 className="modal__title">
            {isNew ? '수강신청이 완료되었습니다' : '이미 수강신청된 항목입니다'}
          </h2>
          <p className="modal__desc" style={{ margin: 0 }}>
            {isNew ? (
              <>
                {subject(applied)} 나의 강의실에 담겼습니다.
                <br />
                지금 바로 학습을 시작하세요.
                {duplicated.length > 0 ? (
                  <>
                    <br />
                    {subject(duplicated)} 이미 신청되어 있어 제외했습니다.
                  </>
                ) : null}
              </>
            ) : (
              <>
                {subject(duplicated)} 이미 나의 강의실에 있습니다.
                <br />
                강의실에서 이어서 학습하실 수 있습니다.
              </>
            )}
          </p>
        </div>
        <div
          className="modal__actions"
          style={{ gridTemplateColumns: '1fr 1.4fr', marginTop: 20 }}
        >
          <button className="btn btn--ghost" type="button" onClick={onClose}>
            계속 둘러보기
          </button>
          <Link className="btn btn--primary" href="/mylecture" ref={primaryRef}>
            나의 강의실로
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
