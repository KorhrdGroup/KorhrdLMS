'use client';

import { useState } from 'react';

/**
 * 무통장입금 계좌정보 복사.
 *
 * 완료 화면에서는 아래 버튼 줄의 주 버튼으로 씁니다(className 을 넘겨 .btn 모양으로).
 * className 을 주지 않으면 예전처럼 글줄 옆에 붙는 작은 버튼이 됩니다.
 */
export default function CopyAccountButton({
  text,
  className,
  label = '계좌 복사',
}: {
  text: string;
  className?: string;
  label?: string;
}) {
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
      className={className}
      style={
        className
          ? undefined
          : {
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
            }
      }
    >
      {copied ? '복사됨 ✓' : label}
    </button>
  );
}
