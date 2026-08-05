'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  completeLectureSessionAction,
  saveLectureVideoProgressAction,
} from '@/features/classroom-lectures/actions/lecture-progress.actions';
import type { ClassroomLectureDetail } from '@/features/classroom-lectures/types/classroom-lecture.types';
import type { ClassroomMaterialItem } from '@/features/classroom-materials/types/classroom-material.types';

/** 진도 저장 주기(초). 너무 잦으면 서버 부담, 너무 뜸하면 이어보기가 부정확해집니다. */
const SAVE_INTERVAL_SECONDS = 10;

const STATUS_LABEL: Record<string, string> = {
  completed: '학습완료',
  in_progress: '학습중',
  not_started: '',
};

/**
 * 강의 재생 화면 — 마크업은 korhrd 디자인(lecture.html), 재생·진도는 기존 강의실 서비스.
 *
 * · 이어보기: 저장된 마지막 위치에서 시작합니다
 * · 진도 저장: 10초마다 + 일시정지·이탈 시
 * · 완료 처리: 영상이 끝나면 해당 차시를 학습완료로 바꿉니다
 */
export function LecturePlayer({
  detail,
  materials = [],
}: {
  detail: ClassroomLectureDetail;
  /** 관리자 자료실에 공개된 이 과정의 학습자료(교안·기출문제 등) */
  materials?: ClassroomMaterialItem[];
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const [percent, setPercent] = useState(detail.session.videoProgressPercent ?? 0);
  const [toast, setToast] = useState<string | null>(null);

  const { session, sessions, courseCode, courseTitle, prevOrder, nextOrder } = detail;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const coursePercent = sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const save = useCallback(
    async (currentTime: number, duration: number) => {
      if (!Number.isFinite(duration) || duration <= 0) return;
      const result = await saveLectureVideoProgressAction(
        courseCode,
        session.order,
        currentTime,
        duration,
      );
      if (result.success) {
        setPercent(result.progressPercent);
        if (result.status === 'completed') router.refresh();
      }
    },
    [courseCode, session.order, router],
  );

  /** 재생 위치가 바뀔 때마다 호출되지만 실제 저장은 10초에 한 번만 합니다 */
  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.currentTime - lastSavedRef.current < SAVE_INTERVAL_SECONDS) return;
    lastSavedRef.current = el.currentTime;
    void save(el.currentTime, el.duration);
  };

  const handleEnded = async () => {
    const el = videoRef.current;
    if (el) await save(el.duration, el.duration);
    const result = await completeLectureSessionAction(courseCode, session.order);
    setToast(result.success ? '이 차시를 학습완료 처리했습니다.' : result.message);
    router.refresh();
  };

  /* 화면을 벗어날 때 마지막 위치를 한 번 더 저장합니다 */
  useEffect(() => {
    const el = videoRef.current;
    return () => {
      if (el && el.duration > 0) void save(el.currentTime, el.duration);
    };
  }, [save]);

  /* 이어보기 — 저장된 위치로 되돌립니다 */
  useEffect(() => {
    const el = videoRef.current;
    const resume = session.resumePositionSeconds ?? 0;
    if (el && resume > 0) {
      el.currentTime = resume;
      lastSavedRef.current = resume;
    }
  }, [session.id, session.resumePositionSeconds]);

  return (
    <div className="container">
      <section className="classroom">
        <div className="classroom__head">
          <div className="classroom__title">
            <h1>{courseTitle}</h1>
            <span className="lec-period">{session.order}강 · 전체 {sessions.length}강</span>
          </div>
          <nav className="breadcrumb" aria-label="현재 위치">
            <ol>
              <li><Link href="/">홈</Link></li>
              <li><Link href="/mylecture">나의 강의실</Link></li>
              <li aria-current="page">강의실</li>
            </ol>
          </nav>
        </div>

        <div className="classroom__grid">
          <div>
            <div className="player__frame" id="player">
              {session.videoUrl ? (
                <video
                  ref={videoRef}
                  src={session.videoUrl}
                  controls
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(event) => event.preventDefault()}
                  onTimeUpdate={handleTimeUpdate}
                  onPause={() => {
                    const el = videoRef.current;
                    if (el) void save(el.currentTime, el.duration);
                  }}
                  onEnded={handleEnded}
                  style={{ width: '100%', height: '100%', background: '#000' }}
                />
              ) : (
                <span className="player__note">
                  이 차시는 아직 영상이 등록되지 않았습니다.
                </span>
              )}
            </div>

            <div className="cur-lecture">
              <h2>{session.order}강. {session.title}</h2>
            </div>

            <div className="lec-progress">
              <span className="lec-progress__label">이 차시 시청률</span>
              <span className="lec-progress__track"><i style={{ width: `${percent}%` }} /></span>
              <span className="lec-progress__pct">{percent}%</span>
            </div>

            <div className="lec-progress">
              <span className="lec-progress__label">강의 진도율</span>
              <span className="lec-progress__track"><i style={{ width: `${coursePercent}%` }} /></span>
              <span className="lec-progress__pct">{coursePercent}%</span>
            </div>

            <p className="rv-cta" style={{ display: 'flex', gap: 8 }}>
              {prevOrder !== null ? (
                <Link className="btn btn--ghost" href={`/lecture/${courseCode}/${prevOrder}`}>이전 강의</Link>
              ) : null}
              {nextOrder !== null ? (
                <Link className="btn btn--primary" href={`/lecture/${courseCode}/${nextOrder}`}>다음 강의</Link>
              ) : null}
            </p>
          </div>

          <aside className="lec-side" aria-label="학습 자료 및 강의 목차">
            {/* 학습자료 — 관리자 자료실에서 공개한 파일을 그대로 내려받습니다 */}
            <div className="panel-card">
              <button className="panel-toggle" type="button" aria-expanded="true" aria-controls="material">
                학습자료<span className="chev" aria-hidden="true">⌄</span>
              </button>
              <div className="material-grid panel-body" id="material">
                {materials.length === 0 ? (
                  <p className="mylec-mini__empty">등록된 학습자료가 없습니다.</p>
                ) : (
                  materials.map((item) =>
                    item.fileUrl ? (
                      <a key={item.id} href={item.fileUrl} download={item.fileName}>
                        <span className="ph" aria-hidden="true" />
                        <b>{item.title}</b>
                        <span>{item.fileName}</span>
                      </a>
                    ) : (
                      <span key={item.id} aria-disabled="true">
                        <span className="ph" aria-hidden="true" />
                        <b>{item.title}</b>
                        <span>파일 준비중</span>
                      </span>
                    ),
                  )
                )}
              </div>
            </div>

            <div className="panel-card">
              <button className="panel-toggle" type="button" aria-expanded="true" aria-controls="toc">
                강의목차 ({completedCount}/{sessions.length})<span className="chev" aria-hidden="true">⌄</span>
              </button>
              <ul className="toc panel-body" id="toc">
                {sessions.map((item) => (
                  <li
                    key={item.id}
                    className={`toc__item${item.order === session.order ? ' is-current' : ''}`}
                  >
                    <Link href={`/lecture/${courseCode}/${item.order}`}>
                      <span className="toc__no">{String(item.order).padStart(2, '0')}강</span>
                      <span className="toc__title">{item.title}</span>
                      <span className="toc__done">{STATUS_LABEL[item.status] ?? ''}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            zIndex: 100, background: '#333', color: '#fff', borderRadius: 8,
            padding: '12px 20px', fontSize: 14,
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}
