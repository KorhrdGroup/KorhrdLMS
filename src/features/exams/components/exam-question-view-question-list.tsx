import { EXAM_QUESTION_TYPE_LABELS } from "@/features/exams/constants";
import {
  formatQuestionAnswerDisplay,
  getQuestionChoicesDisplay,
} from "@/features/exams/lib/exam-question-view.utils";
import type { ExamQuestionViewItem } from "@/features/exams/types/exam-question-view.types";

type ExamQuestionViewQuestionListProps = {
  questions: ExamQuestionViewItem[];
};

export function ExamQuestionViewQuestionList({ questions }: ExamQuestionViewQuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm text-[#9CA3AF]">
        등록된 문제가 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="w-20 px-4 py-3 text-left font-medium text-[#374151]">문항번호</th>
            <th className="min-w-[240px] px-4 py-3 text-left font-medium text-[#374151]">
              문제내용
            </th>
            <th className="min-w-[220px] px-4 py-3 text-left font-medium text-[#374151]">보기</th>
            <th className="w-24 px-4 py-3 text-center font-medium text-[#374151]">정답</th>
            <th className="w-20 px-4 py-3 text-center font-medium text-[#374151]">배점</th>
            <th className="w-24 px-4 py-3 text-center font-medium text-[#374151]">문제유형</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((item) => {
            const choices = getQuestionChoicesDisplay(item.questionType, item);

            return (
              <tr key={item.id} className="border-b border-[#E5E7EB] align-top">
                <td className="px-4 py-4 text-[#6B7280]">{item.number}</td>
                <td className="px-4 py-4 whitespace-pre-wrap text-[#111827]">{item.question}</td>
                <td className="px-4 py-4 text-[#374151]">
                  {choices.length > 0 ? (
                    <ul className="space-y-1">
                      {choices.map((choice) => (
                        <li key={choice}>{choice}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center font-medium text-[#111827]">
                  {formatQuestionAnswerDisplay(item.questionType, item.answer)}
                </td>
                <td className="px-4 py-4 text-center text-[#6B7280]">{item.score}</td>
                <td className="px-4 py-4 text-center">
                  {EXAM_QUESTION_TYPE_LABELS[item.questionType]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
