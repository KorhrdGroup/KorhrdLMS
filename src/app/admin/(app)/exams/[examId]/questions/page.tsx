import { notFound } from "next/navigation";

import { ExamQuestionManageView } from "@/features/exam-management/components/exam-question-manage-view";
import { getExamQuestions } from "@/features/exam-management/services/exam-question.service";

type ExamQuestionsPageProps = {
  params: Promise<{ examId: string }>;
};

export default async function ExamQuestionsPage({ params }: ExamQuestionsPageProps) {
  const { examId } = await params;
  const result = await getExamQuestions(examId);

  if (!result.success) {
    notFound();
  }

  return (
    <ExamQuestionManageView summary={result.summary} questions={result.questions} />
  );
}
