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
  return (
    <CoursesClient
      initial={{
        cat: first(params.cat),
        purpose: first(params.purpose),
        age: first(params.age),
      }}
    />
  );
}
