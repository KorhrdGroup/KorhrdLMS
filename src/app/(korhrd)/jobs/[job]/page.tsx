import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { JOBS, JOB_GROUPS, JOB_SITES, findJob } from '@/features/korhrd/data/jobs';
import { findCourse } from '@/features/korhrd/data/courses';
import styles from './page.module.css';

/**
 * 직업 상세.
 * 프로토타입 원본: korhrd-site/job-detail.html + main.js initJobDetail()
 * 주소는 ?job=이름 대신 /jobs/{직업명} 으로 바뀌었습니다.
 */
type Params = { params: Promise<{ job: string }> };

/** 39개 전부 정적 생성합니다 (데이터가 정적이라 빌드 시 확정됩니다) */
export function generateStaticParams() {
  return JOBS.map((j) => ({ job: encodeURIComponent(j.name) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const job = findJob(decodeURIComponent((await params).job));
  return { title: job ? `${job.name} — 취업 길찾기` : '취업 길찾기' };
}

export default async function JobDetailPage({ params }: Params) {
  const job = findJob(decodeURIComponent((await params).job));
  if (!job) notFound();

  const group = JOB_GROUPS.find((g) => g.key === job.g)!;
  const sites = JOB_SITES[job.g] ?? [];
  const course = findCourse(job.course);

  const chips = (items: string[]) => (
    <div className="jobd-chips">
      {items.map((t) => <span className="jobd-chip" key={t}>{t}</span>)}
    </div>
  );

  return (
    <div className="container">
      <section className="jobguide">
        <nav className="breadcrumb" aria-label="현재 위치">
          <ol>
            <li><Link href="/">홈</Link></li>
            <li><Link href="/jobs">취업 길찾기</Link></li>
            <li><Link href={`/jobs?g=${job.g}`}>{group.name}</Link></li>
            <li aria-current="page">{job.name}</li>
          </ol>
        </nav>

        <div className="jobd-hero">
          <span className="jobd-hero__group">{group.name}</span>
          <h1>{job.name}</h1>
          <p>{job.summary}</p>
        </div>

        <div className="jobd-grid">
          <div className="jobd-main">
            <section className="jobd-block">
              <h2>어떤 일을 하나요?</h2>
              <ul className="jobd-tasklist">
                {job.tasks.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>

            <section className="jobd-block">
              <h2>이런 분에게 추천합니다</h2>
              {chips(job.recommend)}
            </section>

            <section className="jobd-block">
              <h2>주로 근무하는 곳</h2>
              {chips(job.workplaces)}
            </section>

            <section className="jobd-block">
              <h2>이런 채용공고를 찾아보세요</h2>
              {chips(job.keywords)}
              <p className="jobd-note">위 키워드로 검색하면 관련 채용공고를 더 쉽게 찾을 수 있어요.</p>
            </section>

            <section className="jobd-block">
              <h2>채용공고는 여기에서 확인하세요</h2>
              <div className="jobd-sites">
                {sites.map((s) => (
                  <span className="jobd-site" key={s}>
                    <span className="ph" aria-hidden="true" />{s}
                  </span>
                ))}
              </div>
              {/* TODO: 서비스 오픈 시 실제 채용 사이트 링크로 교체 */}
              <p className="jobd-note">※ 외부 채용 사이트로, 실제 링크는 서비스 오픈 시 연결됩니다.</p>
            </section>
          </div>

          <aside className={`jobd-course ${styles.sticky}`}>
            <p className="jobd-course__label">이 직업에 필요한 과정</p>
            <p className="jobd-course__name">{job.course}</p>
            <p className="jobd-course__meta">
              온라인 {course?.hours ?? 20}시간 · <b>수강료 0원</b>
            </p>
            <ul className="jobd-course__flow">
              <li><span className="n">1</span>과정 수강</li>
              <li><span className="n">2</span>시험 응시</li>
              <li><span className="n">3</span>자격증 발급</li>
              <li><span className="n">4</span>{group.name} 취업</li>
            </ul>
            {/* 바로 신청 / 과정 먼저 보기 — 두 갈래를 나란히 둡니다.
                신청이 주 동작이라 남색, 과정 확인은 보조라 흰색입니다.
                btn--block(width:100%)을 빼고 각 버튼이 반씩 나눠 갖게 합니다. */}
            <div className={styles.actions}>
              {course?.code ? (
                <Link className="btn btn--primary" href={`/enrollment?select=${course.code}`}>
                  바로 수강신청
                </Link>
              ) : null}
              <Link className="btn btn--ghost" href={`/courses/${encodeURIComponent(job.course)}`}>
                과정 상세보기
              </Link>
            </div>

            {/* 뒤로가기는 신청 동작이 아니라 목록으로 돌아가는 길입니다.
                버튼 두 개와 같은 덩어리로 보이지 않게 선을 긋고 글자 링크로 뺐습니다. */}
            <p className={styles.back}>
              <Link href={`/jobs?g=${job.g}`}>← 다른 직업 보기</Link>
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
