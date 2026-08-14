import { getVisibleCourseCodes } from '@/features/korhrd/services/course-visibility.service';

import JobsClient from './JobsClient';

/** 취업 길찾기 — 직업군 초기값(?g=)은 서버에서 읽어 prop으로 넘깁니다. */
type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const g = Array.isArray(params.g) ? params.g[0] : params.g;
  /* 수강신청 목록과 같은 기준 — 어드민에서 노출 중인 과정에 연결된 직업만
     보여줍니다. 비노출 과정의 직업이 떠서 신청까지 갔다가 빈 강의실로
     들어가던 것과 같은 문제를 막습니다 (2026-08-14). */
  const visible = await getVisibleCourseCodes();
  return <JobsClient initialGroup={g} visibleCodes={visible ? [...visible] : null} />;
}
