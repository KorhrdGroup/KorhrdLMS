'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { LoginNoticeItem } from '@/features/korhrd/lib/login-notice';
import styles from './LoginNoticeModal.module.css';

/**
 * 로그인 알림 팝업 — 확인이 필요한 진행 상태(시험 응시·재응시·발급 신청·입금)를
 * 로그인 직후 한 번 띄웁니다. 모달 동작(포털·body 잠금·Esc)은 EnrollDoneModal 과
 * 같은 방식입니다.
 *
 * 노출 규칙
 *  · 세션당 한 번 — 페이지를 옮길 때마다 다시 뜨면 안내가 아니라 방해입니다.
 *    (sessionStorage, 탭을 닫으면 초기화되어 다음 로그인 때 다시 뜹니다)
 *  · "오늘 하루 이 창을 보지 않습니다" 체크박스 — **체크한 채로 닫아야** 날짜를
 *    localStorage 에 남기고, 같은 날에는 세션이 바뀌어도 띄우지 않습니다.
 */
const SEEN_KEY = 'korhrd-login-notice-seen';   // sessionStorage — 이 접속에서 봤음
const HIDE_KEY = 'korhrd-login-notice-hide';   // localStorage — 오늘 하루 보지 않기

/** 사용자 시계 기준 오늘 (toISOString 은 UTC 라 밤에 날짜가 밀립니다) */
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// [임시 미리보기] ?preview=notice1~4 로 열면 네 가지 경우를 표본 데이터로 띄웁니다.
// 디자인 확인용이며, 파라미터 없이 열면 실제 데이터 그대로입니다.
const PREVIEW_ITEMS: Record<string, LoginNoticeItem[]> = {
  notice1: [{
    kind: 'exam-ready', course: '보험심사관리사',
    message: '시험 응시 조건(출석 60%)을 달성했습니다. 수료시험에 응시해보세요!',
    href: '/exam/CRS-KH-0081', action: '시험 응시하기',
  }],
  notice2: [{
    kind: 'exam-retry', course: '학교안전지도사',
    message: '아쉽게 합격 기준에 도달하지 못했습니다. 재응시로 다시 도전해보세요!',
    href: '/exam/CRS-KH-0068', action: '재응시하기',
  }],
  notice3: [{
    kind: 'cert-apply', course: '간병사',
    message: '합격을 축하드립니다! 8월 19일까지 자격증 발급을 신청하세요.',
    href: '/certificate?course=간병사', action: '발급 신청하기',
  }],
  notice4: [{
    kind: 'cert-payment', course: '등하원보호사 자격증',
    message: '발급 신청이 접수되었습니다. 입금이 확인되면 자격증 제작이 시작됩니다.',
    href: '/certificate/status', action: '입금 안내 보기',
  }],
};

export default function LoginNoticeModal({ items: realItems }: { items: LoginNoticeItem[] }) {
  const [open, setOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<LoginNoticeItem[] | null>(null);
  const items = previewItems ?? realItems;

  // [임시 미리보기] — 세션당 1회·오늘 하루 규칙을 건너뛰고 바로 띄웁니다
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('preview');
    if (key && PREVIEW_ITEMS[key]) {
      setPreviewItems(PREVIEW_ITEMS[key]);
      setOpen(true);
    }
  }, []);
  // "오늘 하루 보지 않기" 체크 상태 — 체크한 채로 닫아야 저장됩니다.
  // 닫는 순간(cleanup)에도 최신 값을 읽어야 해서 ref 에도 함께 둡니다.
  const [hideToday, setHideToday] = useState(false);
  const hideTodayRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (items.length === 0) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    if (localStorage.getItem(HIDE_KEY) === today()) return;
    sessionStorage.setItem(SEEN_KEY, '1');
    setOpen(true);
  }, [items.length]);

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
    <div className="modal is-open" role="dialog" aria-modal="true" aria-label="확인이 필요한 알림">
      <div className="modal__dim" onClick={close} />
      <div className={`modal__panel ${styles.panel}`}>
        <button
          className={styles.close} type="button" onClick={close} ref={closeRef}
          aria-label="닫기"
        >
          ×
        </button>

        <h2 className="modal__title">잊지 마세요!</h2>
        <p className="modal__desc" style={{ marginBottom: 14 }}>
          회원님께 확인이 필요한 항목이 <b>{items.length}건</b> 있습니다.
        </p>

        <ul className={styles.list}>
          {items.map((item) => (
            <li className={styles.item} key={`${item.kind}-${item.course}`}>
              <div className={styles.body}>
                <b>{item.course}</b>
                <p>{item.message}</p>
              </div>
              <Link className="btn btn--primary" href={item.href} onClick={close}>
                {item.action}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <label className={styles.today}>
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(event) => toggleHideToday(event.target.checked)}
            />
            오늘 하루 이 창을 보지 않습니다
          </label>
        </div>
      </div>
    </div>,
    document.body,
  );
}
