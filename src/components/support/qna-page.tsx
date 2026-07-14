import { QnaList } from "@/components/support/QnaList";
import { QnaShell } from "@/components/support/QnaShell";

/**
 * 1:1 상담 목록. Only reachable while logged in (see
 * src/app/support/qna/page.tsx for the mock access-control redirect).
 */
export function QnaPage() {
  return (
    <QnaShell>
      <QnaList />
    </QnaShell>
  );
}
