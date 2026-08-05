/**
 * 라우트 전환 중 보여줄 뼈대 화면.
 *
 * Next.js는 `loading.tsx`가 없는 동적 라우트는 프리페치를 건너뛰기 때문에,
 * 링크를 눌러도 서버 응답이 올 때까지 화면이 그대로 멈춰 있습니다.
 * 각 라우트에 이 컴포넌트를 쓰는 `loading.tsx`를 두면 스트리밍이 켜져
 * 클릭 즉시 뼈대가 뜨고, 레이아웃은 계속 조작할 수 있습니다.
 */
export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse px-6 py-8" aria-hidden="true">
      <div className="h-7 w-48 rounded-md bg-[#e5e8eb]" />
      <div className="mt-3 h-4 w-72 rounded bg-[#eef1f4]" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-14 rounded-lg bg-[#f2f4f6]" />
        ))}
      </div>
      <span className="sr-only">불러오는 중</span>
    </div>
  );
}
