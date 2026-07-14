import { QnaDetail } from "@/components/support/QnaDetail";
import { QnaShell } from "@/components/support/QnaShell";

export function QnaDetailPage({ id }: { id: string }) {
  return (
    <QnaShell>
      <QnaDetail id={id} />
    </QnaShell>
  );
}
