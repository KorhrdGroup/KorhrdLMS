import { QnaDetail } from "@/components/support/QnaDetail";
import { QnaShell } from "@/components/support/QnaShell";
import type { SupportQnaItem } from "@/features/support-qna/services/support-qna.service";

export function QnaDetailPage({ ticket }: { ticket: SupportQnaItem | null }) {
  return (
    <QnaShell>
      <QnaDetail ticket={ticket} />
    </QnaShell>
  );
}
