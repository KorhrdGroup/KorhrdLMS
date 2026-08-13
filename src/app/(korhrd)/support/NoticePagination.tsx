"use client";

import { useRouter, useSearchParams } from "next/navigation";

import Pagination from "@/features/korhrd/components/ui/Pagination";

/** 서버 컴포넌트 목록에서 쓰는 페이지 이동 — URL ?page= 로 반영합니다.
    분류 탭(?cat=)을 고른 상태면 그대로 유지한 채 페이지만 바꿉니다. */
export function NoticePagination({ current, total }: { current: number; total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat");
  return (
    <Pagination
      current={current}
      total={total}
      onChange={(page) =>
        router.push(`/support?page=${page}${cat ? `&cat=${encodeURIComponent(cat)}` : ""}`)
      }
    />
  );
}
