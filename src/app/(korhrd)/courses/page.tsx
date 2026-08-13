import { getVisibleCourseCodes } from '@/features/korhrd/services/course-visibility.service';

import CoursesClient from './CoursesClient';

/**
 * 수강신청 목록.
 *
 * URL 필터 초기값(cat·purpose·age)은 서버에서 읽어 prop으로 넘깁니다.
 * (클라이언트 useSearchParams + Suspense 구조는 하이드레이션이 매달려
 *  화면이 SSR 그림인 채로 클릭이 안 되는 문제가 있었습니다)
 */
type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  /* 카탈로그(하드코딩 84개) 중 어드민에서 노출 중인 과정만 보여줍니다.
     자료가 없는 과정이 목록에 떠서 신청하면 빈 강의실로 들어가던 문제 (2026-08-13). */
  const visible = await getVisibleCourseCodes();

  return (
    <CoursesClient
      initial={{
        cat: first(params.cat),
        purpose: first(params.purpose),
        age: first(params.age),
        // 헤더 검색과 이 화면의 검색바가 둘 다 /courses?q=… 로 넘어옵니다
        q: first(params.q),
      }}
      visibleCodes={visible ? [...visible] : null}
    />
  );
}
