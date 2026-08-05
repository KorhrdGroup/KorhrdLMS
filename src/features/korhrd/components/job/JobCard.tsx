import Link from 'next/link';
import type { Job } from '@/features/korhrd/lib/types';

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link className="job-card" href={`/jobs/${encodeURIComponent(job.name)}`}>
      <h3>{job.name}</h3>
      <p>{job.summary}</p>
      {/* 카드 전체가 링크라 '더 알아보기'는 두지 않습니다 */}
      <span className="job-card__course">{job.course} 필요</span>
    </Link>
  );
}
