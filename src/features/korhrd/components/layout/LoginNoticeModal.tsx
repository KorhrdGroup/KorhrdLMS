'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { LoginNoticeData } from '@/features/korhrd/lib/login-notice';
import styles from './LoginNoticeModal.module.css';

/**
 * 메인 알림 팝업 — 확인이 필요한 진행 상태(시험 응시·재응시·발급 신청·입금)를
 * **메인에서만** 띄웁니다(레이아웃이 아니라 홈 page.tsx 에 붙어 있습니다).
 * 모달 동작(포털·body 잠금·Esc)은 EnrollDoneModal 과 같은 방식입니다.
 *
 * 구성은 제목(시험/발급 안내) · 과정명(여럿이면 쉼표) + 한 문장 안내 · 버튼
 * 하나입니다. 버튼은 과정별 화면 대신 나의 강의실(④는 발급 내역)로 보냅니다.
 *
 * 노출 규칙 — 메인에 들어올 때마다 뜹니다. 그만 보려면 "오늘 하루 이 창을
 * 보지 않습니다"를 **체크한 채로 닫아야** 하고, 그러면 날짜를 localStorage 에
 * 남겨 그날 하루는 띄우지 않습니다.
 */
const HIDE_KEY = 'korhrd-login-notice-hide';   // localStorage — 오늘 하루 보지 않기

/** 사용자 시계 기준 오늘 (toISOString 은 UTC 라 밤에 날짜가 밀립니다) */
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// [임시 미리보기] ?preview=notice1~4 로 열면 네 가지 경우를 표본 데이터로 띄웁니다.
// 디자인 확인용이며, 파라미터 없이 열면 실제 데이터 그대로입니다.
const PREVIEW_NOTICES: Record<string, LoginNoticeData> = {
  notice1: {
    kind: 'exam-ready', title: '자격증 시험 안내',
    courses: ['보험심사관리사', '간병사'],
    message: '수료시험 응시가 가능합니다.',
    href: '/mylecture', action: '시험 응시하기',
  },
  notice2: {
    kind: 'exam-retry', title: '자격증 시험 안내',
    courses: ['학교안전지도사'],
    message: '수료시험에 재응시하실 수 있습니다.',
    href: '/mylecture', action: '재응시하기',
  },
  notice3: {
    kind: 'cert-apply', title: '자격증 발급 안내',
    courses: ['간병사'],
    message: '합격했습니다! 자격증 발급을 신청하세요.',
    href: '/mylecture', action: '발급 신청하기',
  },
  notice4: {
    kind: 'cert-payment', title: '자격증 발급 안내',
    courses: ['생활지원사 자격증', '심리상담사 자격증'],
    message: '입금 확인 후 자격증 제작이 시작됩니다.',
    href: '/certificate/status', action: '입금 안내 보기',
  },
};

export default function LoginNoticeModal({ notice: realNotice }: { notice: LoginNoticeData }) {
  const [open, setOpen] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<LoginNoticeData | null>(null);
  const notice = previewNotice ?? realNotice;
  // "오늘 하루 보지 않기" 체크 상태 — 체크한 채로 닫아야 저장됩니다.
  // 닫는 순간(cleanup)에도 최신 값을 읽어야 해서 ref 에도 함께 둡니다.
  const [hideToday, setHideToday] = useState(false);
  const hideTodayRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // [임시 미리보기] — 오늘 하루 규칙을 건너뛰고 바로 띄웁니다
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('preview');
    if (key && PREVIEW_NOTICES[key]) {
      setPreviewNotice(PREVIEW_NOTICES[key]);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(HIDE_KEY) === today()) return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add('is-locked');
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      // 어떤 경로로 닫혔든(X·딤·Esc·이동) 체크돼 있었다면 오늘 하루 숨깁니다
      if (hideTodayRef.current) localStorage.setItem(HIDE_KEY, today());
    };
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);
  const toggleHideToday = (checked: boolean) => {
    setHideToday(checked);
    hideTodayRef.current = checked;
  };

  return createPortal(
    <div className="modal is-open" role="dialog" aria-modal="true" aria-label={notice.title}>
      <div className="modal__dim" onClick={close} />
      <div className={`modal__panel ${styles.panel}`}>
        <button
          className={styles.close} type="button" onClick={close} ref={closeRef}
          aria-label="닫기"
        >
          ×
        </button>

        <h2 className="modal__title">{notice.title}</h2>
        <div className={styles.box}>
          <b>{notice.courses.join(', ')}</b>
          <p>{notice.message}</p>
        </div>

        <p className={styles.cta}>
          <Link className="btn btn--primary" href={notice.href} onClick={close}>
            {notice.action}
          </Link>
        </p>

        {/* 글자는 안내일 뿐 — label 로 묶지 않아 체크박스만 눌러 켜고 끕니다 */}
        <div className={styles.foot}>
          <input
            className={styles.check}
            type="checkbox"
            checked={hideToday}
            onChange={(event) => toggleHideToday(event.target.checked)}
            aria-label="오늘 하루 이 창을 보지 않습니다"
          />
          <span className={styles.today}>오늘 하루 이 창을 보지 않습니다</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
