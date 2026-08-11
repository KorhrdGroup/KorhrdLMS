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
import LectureFaq from '@/features/korhrd/components/classroom/LectureFaq';

/** 진도 저장 주기(초). 너무 잦으면 서버 부담, 너무 뜸하면 이어보기가 부정확해집니다. */
const SAVE_INTERVAL_SECONDS = 10;

const STATUS_LABEL: Record<string, string> = {
  completed: '학습완료',
  in_progress: '학습중',
  not_started: '',
};

/** 좁은 화면(모바일·태블릿) 기준 — classroom.css 가 한 칸으로 바꾸는 지점과 같습니다 */
const NARROW = '(max-width: 980px)';

/**
 * 지금 좁은 화면인가. 서버와 첫 렌더에서는 알 수 없어 null 입니다.
 * 화면 폭은 CSS 만 아는 값이라, 값을 모르는 동안의 접힘/펼침은 CSS 가 정합니다
 * (.panel-card[data-open="auto"]). 여기서 얻은 값은 aria-expanded 를 실제와
 * 맞추는 데 씁니다.
 */
function useNarrow() {
  const [narrow, setNarrow] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return narrow;
}

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
  practiceHref,
}: {
  detail: ClassroomLectureDetail;
  /** 관리자 자료실에 공개된 이 과정의 학습자료(교안·기출문제 등) */
  materials?: ClassroomMaterialItem[];
  /** 기출문제 풀이 화면 주소. 등록된 기출문제가 없으면 없습니다 */
  practiceHref?: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedRef = useRef(0);
  const tocListRef = useRef<HTMLUListElement>(null);
  const currentItemRef = useRef<HTMLLIElement>(null);
  const [percent, setPercent] = useState(detail.session.videoProgressPercent ?? 0);

  /* 학습자료 앞 두 칸에 넣을 파일.
     교안은 같은 파일을 "내려받기 / 새 탭 미리보기" 두 방식으로 엽니다.
     자료실에 '예시' 파일이 따로 있으면 미리보기는 그 파일을 씁니다. */
  const sample = materials.find((item) => item.title.includes('예시'));
  const handout = materials.find((item) => item !== sample) ?? sample;
  const preview = sample ?? handout;
  const [toast, setToast] = useState<string | null>(null);

  /* 학습자료·강의목차 접기.
     null = 아직 손대지 않음 → 기본값을 씁니다(넓은 화면 펼침 / 좁은 화면 접힘).
     좁은 화면에서는 영상이 먼저 보여야 하는데 20강짜리 목차가 펼쳐져 있으면
     한참 내려야 영상이 나옵니다 (2026-08-11, 디자인 요청). */
  const narrow = useNarrow();
  const [tocOpen, setTocOpen] = useState<boolean | null>(null);
  const [materialOpen, setMaterialOpen] = useState<boolean | null>(null);

  /** 화면 폭을 모르는 동안에는 "auto" 를 내보내고 CSS 에 맡깁니다 */
  const panelState = (open: boolean | null) =>
    open !== null ? String(open) : narrow === null ? 'auto' : String(!narrow);
  const isOpen = (open: boolean | null) => (open !== null ? open : narrow === null ? true : !narrow);

  const tocExpanded = isOpen(tocOpen);
  const materialExpanded = isOpen(materialOpen);

  /* 좁은 화면에서 목차는 바텀시트라, 열려 있는 동안은 뒤 화면이 밀려 내려가지
     않게 잠그고 Esc 로 닫습니다 (수강신청 필터 시트와 같은 처리). */
  const tocIsSheet = narrow === true && tocExpanded;
  useEffect(() => {
    if (!tocIsSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTocOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [tocIsSheet]);

  /* 시트에서 차시를 고르면 그 강의로 넘어갑니다 — 시트는 닫아 둡니다.
     넓은 화면의 목차는 늘 펼쳐 두는 자리라 건드리지 않습니다. */
  useEffect(() => {
    if (narrow) setTocOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.session.order]);

  const { session, sessions, courseCode, courseTitle, prevOrder, nextOrder } = detail;
  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const coursePercent = sessions.length ? Math.round((completedCount / sessions.length) * 100) : 0;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* 목차는 560px에서 잘리고 안쪽만 스크롤됩니다. 다음 강의로 넘어가면 목록이
     맨 위(1강)부터 보여 지금 듣는 차시를 매번 찾아 내려야 했습니다.
     현재 차시가 목록 가운데쯤 오도록 컨테이너만 스크롤합니다 —
     scrollIntoView 를 쓰면 페이지 전체가 같이 움직입니다.

     offsetTop 은 위치 기준(offsetParent)이 .toc__list 가 아니라 바깥 카드라
     머리말 높이만큼 더 내려가 현재 차시가 화면 위로 밀려났습니다.
     두 요소의 화면 좌표 차이로 재면 기준과 무관하게 맞습니다. */
  useEffect(() => {
    const list = tocListRef.current;
    const item = currentItemRef.current;
    if (!list || !item) return;

    const delta =
      item.getBoundingClientRect().top -
      list.getBoundingClientRect().top -
      (list.clientHeight - item.clientHeight) / 2;

    list.scrollTop = Math.max(0, list.scrollTop + delta);
  }, [session.order]);

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
                  autoPlay
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

            {/* 원본(lecture.html)에는 진도율 막대가 하나뿐입니다.
                차시별 시청률은 화면에 없던 것이라 뺐습니다 — 재생 저장에는 계속 씁니다. */}
            <div className="lec-progress">
              <span className="lec-progress__label">강의 진도율</span>
              <span className="lec-progress__track"><i style={{ width: `${coursePercent}%` }} /></span>
              <span className="lec-progress__pct">{coursePercent}%</span>
            </div>

            {/* 이동 줄 — 이전 · 강의목차 · 다음.
                이 줄 전체가 넓은 화면에서는 숨겨집니다(오른쪽에 목차가 늘 펼쳐져
                있으니 필요 없습니다). 그래서 가운데 목차 버튼에도 따로 감추는
                규칙이 필요 없습니다. 한 줄에 나눠 놓는 규칙은 overrides.css 에
                있습니다 — 인라인 style 이면 숨기는 규칙을 이깁니다. */}
            <p className="rv-cta">
              {prevOrder !== null ? (
                <Link className="btn btn--ghost" href={`/lecture/${courseCode}/${prevOrder}`}>이전</Link>
              ) : null}
              <button
                className="btn btn--ghost toc-open"
                type="button"
                aria-expanded={tocExpanded}
                aria-controls="toc"
                onClick={() => setTocOpen(!tocExpanded)}
              >
                강의목차
              </button>
              {nextOrder !== null ? (
                <Link className="btn btn--primary" href={`/lecture/${courseCode}/${nextOrder}`}>다음</Link>
              ) : null}
            </p>

            {/* 원본 lecture.html 과 같은 자리 — 진도율 아래 자주 묻는 질문 */}
            <LectureFaq />
          </div>

          <aside className="lec-side" aria-label="학습 자료 및 강의 목차">
            {/* 학습자료 — 관리자 자료실에서 공개한 파일을 그대로 내려받습니다 */}
            <div className="panel-card" data-open={panelState(materialOpen)}>
              <button
                className="panel-toggle"
                type="button"
                aria-expanded={materialExpanded}
                aria-controls="material"
                onClick={() => setMaterialOpen(!materialExpanded)}
              >
                학습자료<span className="chev" aria-hidden="true">⌄</span>
              </button>
              {/* 교안파일 다운로드 · 교안파일 미리보기 · 기출문제 3칸 고정입니다.
                  같은 교안 파일을 두 방식으로 엽니다 — 내려받기(download)와
                  새 탭 미리보기. 자료실에 '예시' 파일이 따로 올라와 있으면
                  미리보기는 그 파일을 씁니다. 기출문제만 파일이 아니라 풀이 화면입니다. */}
              {/* 여닫힘은 FAQ 와 같은 grid 0fr↔1fr 모프입니다(review.css .faq__a).
                  바깥이 높이를 애니메이션하고, 안쪽이 잘라 냅니다 —
                  안쪽에 padding 이 있으면 0fr 이 그 높이로 고정돼 안 닫힙니다. */}
              <div className="panel-body" id="material">
                <div className="panel-body-inner" inert={!materialExpanded}>
                  <div className="material-grid">
                {/* R2 는 다른 출처라 <a download> 가 무시되고 현재 창에서 열립니다.
                    같은 출처인 API 를 거쳐 attachment 로 받아야 내려받아집니다. */}
                {handout?.fileUrl ? (
                  <a href={`/api/materials/${handout.id}/download`}>
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/handout-download.svg" alt="" width={34} height={34} />
                    </span>
                    교안파일<br />다운로드
                  </a>
                ) : (
                  <span aria-disabled="true">
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/handout-download.svg" alt="" width={34} height={34} />
                    </span>
                    교안파일<br />다운로드
                  </span>
                )}

                {preview?.fileUrl ? (
                  <a href={preview.fileUrl} target="_blank" rel="noreferrer">
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/handout-preview.svg" alt="" width={34} height={34} />
                    </span>
                    교안파일<br />미리보기
                  </a>
                ) : (
                  <span aria-disabled="true">
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/handout-preview.svg" alt="" width={34} height={34} />
                    </span>
                    교안파일<br />미리보기
                  </span>
                )}

                {/* 기출문제는 내려받는 파일이 아니라 강의실 안에서 바로 풉니다 */}
                {practiceHref ? (
                  <Link href={practiceHref}>
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/practice.svg" alt="" width={34} height={34} />
                    </span>
                    기출문제
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    <span className="m-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/korhrd/img/material/practice.svg" alt="" width={34} height={34} />
                    </span>
                    기출문제
                  </span>
                )}
                  </div>
                </div>
              </div>
            </div>

            {/* 강의목차 — 넓은 화면에서는 오른쪽 카드, 좁은 화면에서는 바텀시트.
                껍데기는 전달본 수강신청 필터 시트(.fsheet)를 그대로 씁니다.
                목록을 두 벌 그리지 않으려고 한 덩어리를 감싸기만 했습니다 —
                981px 부터는 .toc-sheet 와 .fsheet__panel 이 display:contents 가
                되어 카드가 다시 .lec-side 의 자식으로 돌아갑니다(overrides.css).

                data-open 을 껍데기에도 답니다. 시트가 올라와 있는지(껍데기)와
                목록이 펼쳐져 있는지(카드)가 같은 값을 쓰기 때문입니다. */}
            <div className="fsheet toc-sheet" data-open={panelState(tocOpen)}>
              <div className="fsheet__dim" onClick={() => setTocOpen(false)} />
              <div className="fsheet__panel" role="dialog" aria-modal="true" aria-label="강의목차">
            <div className="panel-card" data-open={panelState(tocOpen)}>
              {/* 원본은 접히지 않는 머리말(div)이었습니다. 좁은 화면에서 기본으로
                  접어 두기로 하면서 버튼으로 바꿉니다 — 클래스는 그대로 두고
                  셰브론만 더합니다(학습자료·FAQ 와 같은 모양). */}
              <button
                className="toc__head"
                type="button"
                aria-expanded={tocExpanded}
                aria-controls="toc"
                onClick={() => setTocOpen(!tocExpanded)}
              >
                <b>강의목차 <span>총 {sessions.length}강</span></b>
                <span className="toc__badge">{completedCount}/{sessions.length} 완료</span>
                <span className="chev" aria-hidden="true" />
              </button>
              {/* 학습자료와 같은 모프 구조입니다. 목록 자체는 max-height + 스크롤을
                  그대로 유지해야 해서, 감싸는 두 겹을 따로 둡니다. */}
              <div className="toc__panel" id="toc">
                <div className="toc__panel-inner" inert={!tocExpanded}>
                  <ul className="toc__list" ref={tocListRef}>
                    {sessions.map((item) => (
                      <li
                        key={item.id}
                        ref={item.order === session.order ? currentItemRef : undefined}
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
              </div>
            </div>
              </div>
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
