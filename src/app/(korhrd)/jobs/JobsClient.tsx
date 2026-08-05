'use client';

import { useState } from 'react';
import { JOB_GROUPS, jobsOfGroup } from '@/features/korhrd/data/jobs';
import JobGroupCard from '@/features/korhrd/components/job/JobGroupCard';
import JobCard from '@/features/korhrd/components/job/JobCard';
import styles from './page.module.css';

/**
 * 취업 길찾기.
 * 프로토타입 원본: korhrd-site/jobs.html + main.js initJobsPage()
 *
 * "무슨 자격증을 따야 하지?"가 아니라 "어떤 일을 하고 싶은가"에서 출발하는 화면입니다.
 * 직업군을 고르면 아래 목록만 갈아끼우고 페이지 이동은 하지 않습니다(주소만 갱신).
 */
export default function JobsClient({ initialGroup }: { initialGroup?: string }) {
  const [current, setCurrent] = useState(
    () => JOB_GROUPS.find((g) => g.key === initialGroup)?.key ?? JOB_GROUPS[0].key,
  );

  const group = JOB_GROUPS.find((g) => g.key === current)!;
  const jobs = jobsOfGroup(current);

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
            <li><a href="/">홈</a></li>
            <li aria-current="page">취업 길찾기</li>
          </ol>
        </nav>

        <div className="jobguide-intro">
          <h2>어떤 일을 하고 싶으세요?</h2>
          <p>
            “무슨 자격증을 따야 하지?”가 아니라 “어떤 일을 하고 싶은가”부터 시작하세요.<br />
            직업을 고르면 하는 일 · 근무하는 곳 · 채용공고 · 필요한 과정까지 한 번에 안내해 드립니다.
          </p>

          {/* 모바일에서도 한 줄로 두고 가로 스크롤합니다 (styles/job.css) */}
          <div className="job-flow" aria-label="취업까지의 흐름">
            <span className="job-flow__step is-key">직업 선택</span>
            <span className="job-flow__arrow" aria-hidden="true">→</span>
            <span className="job-flow__step">필요한 자격증</span>
            <span className="job-flow__arrow" aria-hidden="true">→</span>
            <span className="job-flow__step">강의 수강</span>
            <span className="job-flow__arrow" aria-hidden="true">→</span>
            <span className="job-flow__step">시험 응시</span>
            <span className="job-flow__arrow" aria-hidden="true">→</span>
            <span className="job-flow__step">자격증 발급</span>
            <span className="job-flow__arrow" aria-hidden="true">→</span>
            <span className="job-flow__step is-key">취업</span>
          </div>
        </div>

        <h2 className="sr-only">직업군 선택</h2>
        <div className="job-groups" aria-label="직업군 선택">
          {JOB_GROUPS.map((g) => (
            <JobGroupCard key={g.key} group={g} active={g.key === current} onSelect={() => select(g.key)} />
          ))}
        </div>

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
