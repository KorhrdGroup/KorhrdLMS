'use client';

import { useState } from 'react';

/** 무통장입금 계좌정보 복사 — 완료 화면의 "입금하실 금액" 줄 옆에 붙습니다. */
export default function CopyAccountButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // 클립보드 권한이 없는 브라우저 대비 — 구식이지만 확실한 방법
          const input = document.createElement('input');
          input.value = text;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          input.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      style={{
        marginLeft: 8,
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        border: '1px solid var(--line, #E5E7EB)',
        background: '#fff',
        color: copied ? 'var(--green, #0A7350)' : 'var(--muted, #6B7280)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '복사됨 ✓' : '계좌 복사'}
    </button>
  );
}
