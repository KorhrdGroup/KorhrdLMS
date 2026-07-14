/**
 * 시험관리(/admin/exams) 타입 정의입니다.
 *
 * Supabase `exams` / `exam_questions` 테이블을 그대로 사용합니다(과정별 인쇄용
 * 문제은행 `/admin/exams/questions`와 동일한 테이블). `exams.course_id`로 과정에
 * 직접 연결되며, `is_published`로 학생 응시 가능 여부를 제어합니다.
 *
 * 민간자격증 LMS 운영 방식에서는 시험 종류가 "최종시험"(final_exam) 하나뿐이며,
 * 응시기간을 따로 관리하지 않고 학생의 수강기간(enrollments.start_date~end_date)
 * 안에서만 응시할 수 있습니다. 그래서 등록/수정 입력값에는 시험종류·응시기간이
 * 없고, 항상 "최종시험"으로 저장됩니다(자세한 내용은 exam-registration.service.ts).
 *
 * `src/features/exam-management/repositories/exam.repository.ts`의 함수 시그니처만
 * 유지한 채 내부 구현을 교체하면 서비스/액션/컴포넌트 레이어는 변경하지 않아도 됩니다.
 */
export type ExamKind = "midterm" | "final" | "mock" | "certificate" | "quiz" | "final_exam";

export type ExamQuestionAnswer = "1" | "2" | "3" | "4";

export type ExamQuestion = {
  id: string;
  order: number;
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  answer: ExamQuestionAnswer;
  score: number;
};

export type Exam = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  examKind: ExamKind;
  durationMinutes: number;
  passScore: number | null;
  isPublished: boolean;
  createdAt: string;
  questions: ExamQuestion[];
};

export type ExamListItem = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  examKind: ExamKind;
  durationMinutes: number;
  passScore: number | null;
  isPublished: boolean;
  questionCount: number;
  createdAt: string;
};

export type ExamCourseOption = { id: string; name: string; code: string };

export type ExamFilterOptions = {
  courses: ExamCourseOption[];
};

export type ExamPublishFilter = "" | "published" | "unpublished";

export type ExamListQuery = {
  page: number;
  pageSize: number;
  search: string;
  courseId: string;
  examKind: "" | ExamKind;
  publish: ExamPublishFilter;
};

export type ExamRegistrationInput = {
  courseId: string;
  title: string;
  durationMinutes: string;
  passScore: string;
  isPublished: boolean;
};

export type ExamRegistrationResult =
  | { success: true; examId: string; message: string }
  | { success: false; message: string; field?: keyof ExamRegistrationInput };

export type ExamEditInput = ExamRegistrationInput;

export type ExamEditDetail = ExamEditInput & {
  id: string;
  courseName: string;
};

export type ExamEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof ExamEditInput };

export type GetExamForEditResult =
  | { success: true; exam: ExamEditDetail }
  | { success: false; message: string };

export type ExamDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
