import JobsClient from './JobsClient';

/** 취업 길찾기 — 직업군 초기값(?g=)은 서버에서 읽어 prop으로 넘깁니다. */
type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const g = Array.isArray(params.g) ? params.g[0] : params.g;
  return <JobsClient initialGroup={g} />;
}
