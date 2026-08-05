import type { Metadata } from "next";

import NotFoundContent from "@/features/korhrd/components/NotFoundContent";
import { KorhrdShell } from "@/features/korhrd/components/layout/KorhrdShell";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 — 한평생 직업훈련",
  robots: { index: false },
};

/**
 * 어느 라우트에도 매칭되지 않는 주소의 404입니다.
 *
 * 라우트 그룹 레이아웃(`(korhrd)/layout.tsx`)을 타지 않으므로 껍데기를 직접
 * 두릅니다. 학생 화면 세션은 여기서 읽지 않아 헤더는 비로그인 상태로 나옵니다.
 */
export default function NotFound() {
  return (
    <KorhrdShell>
      <NotFoundContent />
    </KorhrdShell>
  );
}
