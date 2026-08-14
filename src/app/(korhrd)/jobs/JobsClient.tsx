'use client';

import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { JOB_GROUPS, jobsOfGroup } from '@/features/korhrd/data/jobs';
import { findCourse } from '@/features/korhrd/data/courses';
import type { Job } from '@/features/korhrd/lib/types';
import JobGroupCard from '@/features/korhrd/components/job/JobGroupCard';
import JobCard from '@/features/korhrd/components/job/JobCard';
import Carousel from '@/features/korhrd/components/ui/Carousel';
import styles from './page.module.css';

/**
 * 취업 길찾기.
 * 프로토타입 원본: korhrd-site/jobs.html + main.js initJobsPage()
 *
 * "무슨 자격증을 따야 하지?"가 아니라 "어떤 일을 하고 싶은가"에서 출발하는 화면입니다.
 * 직업군을 고르면 아래 목록만 갈아끼우고 페이지 이동은 하지 않습니다(주소만 갱신).
 */
/** 취업 흐름 단계 — is-key 는 처음(직업 선택)과 끝(취업)만 흰 칸으로 강조합니다 */
const FLOW_STEPS: { label: string; key?: true }[] = [
  { label: '직업 선택', key: true },
  { label: '필요한 자격증' },
  { label: '강의 수강' },
  { label: '시험 응시' },
  { label: '자격증 발급' },
  { label: '취업', key: true },
];

function FlowSteps() {
  return (
    <>
      {FLOW_STEPS.map(({ label, key }, i) => (
        <Fragment key={label}>
          {i > 0 && <span className="job-flow__arrow" aria-hidden="true">→</span>}
          <span className={key ? 'job-flow__step is-key' : 'job-flow__step'}>{label}</span>
        </Fragment>
      ))}
    </>
  );
}

export default function JobsClient({ initialGroup, visibleCodes }: {
  initialGroup?: string;
  /** 어드민에서 노출 중인 과정 코드. null이면(조회 실패) 카탈로그 전체 기준 */
  visibleCodes?: string[] | null;
}) {
  /* 연결된 과정이 카탈로그에 있고 노출 중인 직업만 보여줍니다 —
     비노출 과정의 직업이 목록에 뜨지 않게 (2026-08-14) */
  const isJobVisible = (job: Job) => {
    const course = findCourse(job.course);
    if (!course) return false;
    return !visibleCodes || visibleCodes.includes(course.code);
  };

  /* 보여줄 직업이 하나도 없는 직업군은 카드 자체를 숨깁니다 */
  const visibleGroups = JOB_GROUPS.filter((g) => jobsOfGroup(g.key).some(isJobVisible));
  const groupList = visibleGroups.length > 0 ? visibleGroups : JOB_GROUPS;

  const [current, setCurrent] = useState(
    () => groupList.find((g) => g.key === initialGroup)?.key ?? groupList[0].key,
  );

  const group = groupList.find((g) => g.key === current) ?? groupList[0];
  const jobs = jobsOfGroup(group.key).filter(isJobVisible);

  /* 980px 이하에서는 .job-flow 가 display:block 이 되어 여섯 단계가 줄바꿈됩니다.
     원본과 같이 단계를 한 벌 더 복제한 트랙으로 감싸 한 줄로 굴립니다 —
     사본이 없으면 -50% 지점에서 빈 구간이 생깁니다 (job.css @media 980). */
  const [rolling, setRolling] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width:980px)');
    const apply = () => setRolling(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const select = (key: string) => {
    setCurrent(key);
    /* 뒤로가기 이력을 남기지 않고 주소만 맞춥니다 (공유·새로고침 대응) */
    window.history.replaceState(null, '', `/jobs?g=${key}`);
  };

  return (
    <div className="container">
      <section className="jobguide">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li aria-current="page">취업 길찾기</li>
          </ol>
        </nav>

        <div className="jobguide-intro">
          <h2>어떤 일을 하고 싶으세요?</h2>
          <p>
            “무슨 자격증을 따야 하지?”가 아니라 “어떤 일을 하고 싶은가”부터 시작하세요.<br />
            직업을 고르면 하는 일 · 근무하는 곳 · 채용공고 · 필요한 과정까지 한 번에 안내해 드립니다.
          </p>

          {/* 데스크톱은 한 줄에 다 들어가므로 단계를 그대로 두고,
              980px 이하에서만 트랙으로 감싸 가로로 흘려보냅니다 */}
          <div className="job-flow" aria-label="취업까지의 흐름">
            {rolling ? (
              <div className="job-flow__track is-rolling">
                <span className="job-flow__seq"><FlowSteps /></span>
                <span className="job-flow__seq" aria-hidden="true"><FlowSteps /></span>
              </div>
            ) : (
              <FlowSteps />
            )}
          </div>
        </div>

        <h2 className="sr-only">직업군 선택</h2>
        {/* 980px 이하에서 .job-groups 가 가로 스크롤로 바뀝니다(job.css @media 980).
            스크롤바는 감춰져 있어 dot 이 없으면 뒤쪽 직업군이 있는 줄 모르고 지나칩니다.
            데스크톱은 5열 그리드라 넘칠 게 없어 dot 이 저절로 숨겨집니다. */}
        <Carousel className="job-groups" label="직업군 선택" dotsLabel="직업군 목록 이동">
          {groupList.map((g) => (
            <JobGroupCard key={g.key} group={g} active={g.key === group.key} onSelect={() => select(g.key)} />
          ))}
        </Carousel>

        <div className="job-result-head">
          <h2>{group.name} 분야에서 할 수 있는 일</h2>
        </div>
        <div className={`job-list ${styles.list}`}>
          {jobs.map((j) => <JobCard key={j.name} job={j} />)}
        </div>
      </section>
    </div>
  );
}
