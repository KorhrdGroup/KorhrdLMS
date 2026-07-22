import { QnaShell } from "@/components/support/QnaShell";
import { QnaWrite } from "@/components/support/QnaWrite";

export function QnaWritePage({ authorName }: { authorName: string }) {
  return (
    <QnaShell>
      <QnaWrite authorName={authorName} />
    </QnaShell>
  );
}
