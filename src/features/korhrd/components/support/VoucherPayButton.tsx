'use client';

import { useState } from 'react';

import VoucherPayForm from '@/app/(korhrd)/voucher/VoucherPayForm';

/**
 * 고객센터 사이드바의 "평생교육이용권 결제" 버튼 — 팝업(모달)으로 결제 폼을 띄웁니다.
 * 폼은 /voucher 페이지와 같은 컴포넌트라 결제 흐름(나이스페이)은 동일합니다.
 */
export default function VoucherPayButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 카카오톡 상담 배너와 같은 짜임 — 글 왼쪽 + 이용권 아이콘 오른쪽 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, width: '100%', padding: 16,
          background: '#EBF3FE', color: '#191F28',
          border: 'none', borderRadius: 10, cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
          평생교육이용권<br />결제
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/voucher-banner-icon.png"
          alt=""
          aria-hidden="true"
          style={{ display: 'block', width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
        />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="평생교육이용권 결제"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: 'rgba(15,18,25,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
              background: '#fff', borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #E5E8EB' }}>
              <strong style={{ fontSize: 16 }}>평생교육이용권 결제</strong>
              <button
                type="button" aria-label="닫기" onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 18, color: '#8B95A1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 4 }}>
              <VoucherPayForm />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
