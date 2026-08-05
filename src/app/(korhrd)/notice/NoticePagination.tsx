"use client";

import { useRouter } from "next/navigation";

import Pagination from "@/features/korhrd/components/ui/Pagination";

/** 서버 컴포넌트 목록에서 쓰는 페이지 이동 — URL ?page= 로 반영합니다. */
export function NoticePagination({ current, total }: { current: number; total: number }) {
  const router = useRouter();
  return (
    <Pagination
      current={current}
      total={total}
      onChange={(page) => router.push(`/notice?page=${page}`)}
    />
  );
}
