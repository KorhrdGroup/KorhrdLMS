import { QnaList } from "@/components/support/QnaList";
import { QnaShell } from "@/components/support/QnaShell";
import type { SupportQnaItem } from "@/features/support-qna/services/support-qna.service";

/**
 * 1:1 상담 목록. 데이터는 서버(board_posts, board_type='consultation')에서 조회해
 * 전달받으며, 어드민 게시판관리(상담문의)와 같은 데이터를 바라봅니다.
 */
export function QnaPage({ tickets }: { tickets: SupportQnaItem[] }) {
  return (
    <QnaShell>
      <QnaList tickets={tickets} />
    </QnaShell>
  );
}
