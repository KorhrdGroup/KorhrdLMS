'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

/**
 * 수강신청 완료 모달.
 * 프로토타입 원본: assets/js/main.js 의 initEnroll() — 마크업·클래스를 그대로 옮겼습니다.
 *
 * 원본 동작을 함께 가져왔습니다.
 *  · 열리면 body에 .is-locked (뒤 배경 스크롤 잠금)
 *  · Esc로 닫힘, 열릴 때 기본 버튼에 포커스
 *  · 닫으면 열기 전 눌렀던 곳으로 포커스 복귀
 */
export default function EnrollDoneModal({
  courses,
  onClose,
}: {
  /** 신청된 과정명들. 비어 있으면 모달을 띄우지 않습니다 */
  courses: string[];
  onClose: () => void;
}) {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (courses.length === 0) return;

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
  }, [courses.length, onClose]);

  if (courses.length === 0) return null;

  const head =
    courses.length === 1
      ? `‘${courses[0]}’ 과정이`
      : `‘${courses[0]}’ 외 ${courses.length - 1}개 과정이`;

  return (
    <div className="modal is-open" role="dialog" aria-modal="true" aria-label="수강신청 완료">
      <div className="modal__dim" onClick={onClose} />
      <div className="modal__panel">
        <div className="modal__result">
          <span className="mark" aria-hidden="true">✓</span>
          <h2 className="modal__title">수강신청이 완료되었습니다</h2>
          <p className="modal__desc" style={{ margin: 0 }}>
            {head} 나의 강의실에 담겼습니다.
            <br />
            지금 바로 학습을 시작하세요.
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
    </div>
  );
}
