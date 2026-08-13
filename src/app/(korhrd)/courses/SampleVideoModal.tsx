'use client';

import { useEffect } from 'react';

export type SampleVideo = {
  courseName: string;
  title: string;
  url: string;
};

/**
 * 수강신청 목록 "강의 샘플" 팝업 — 어두운 배경 위에 1강 영상만 재생합니다.
 * 배경 클릭·✕·ESC 로 닫습니다. 열려 있는 동안 뒤 화면 스크롤을 잠급니다.
 */
export default function SampleVideoModal({
  sample,
  onClose,
}: {
  sample: SampleVideo | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!sample) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [sample, onClose]);

  if (!sample) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${sample.courseName} 강의 샘플`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(15, 18, 25, 0.78)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ width: 'min(920px, 100%)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>강의 샘플 · 1강</div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {sample.courseName} — {sample.title}
            </div>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            style={{
              flex: 'none',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.16)',
              color: '#fff',
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <video
          src={sample.url}
          controls
          autoPlay
          playsInline
          controlsList="nodownload"
          onContextMenu={(event) => event.preventDefault()}
          style={{
            width: '100%',
            maxHeight: '70vh',
            borderRadius: 12,
            background: '#000',
            display: 'block',
          }}
        />

        <p style={{ marginTop: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          샘플은 1강만 제공됩니다. 전체 강의는 수강신청 후 학습강의실에서 보실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
