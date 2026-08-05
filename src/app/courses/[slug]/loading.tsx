/**
 * 과정 상세는 DB 조회가 여러 건이라 서버 응답이 가장 오래 걸립니다.
 * 히어로 영역 모양만 미리 그려 클릭 즉시 반응이 보이게 합니다.
 */
export default function Loading() {
  return (
    <div className="animate-pulse px-6 py-10" aria-hidden="true">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="h-[260px] w-full rounded-2xl bg-[#f2f4f6]" />
        <div className="mt-8 h-8 w-2/3 rounded-md bg-[#e5e8eb]" />
        <div className="mt-4 h-4 w-1/2 rounded bg-[#eef1f4]" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="h-28 rounded-xl bg-[#f2f4f6]" />
          <div className="h-28 rounded-xl bg-[#f2f4f6]" />
        </div>
      </div>
      <span className="sr-only">과정 정보를 불러오는 중</span>
    </div>
  );
}
