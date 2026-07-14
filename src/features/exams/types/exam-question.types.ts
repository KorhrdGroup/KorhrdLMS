import type { ExamKind, ExamType } from "@/types/database.types";

export type ExamQuestionListQuery = {
  page: number;
  pageSize: number;
  courseId: string;
  examKind: string;
  examType: string;
};

export type ExamQuestionListItem = {
  id: string;
  year: number;
  courseName: string;
  name: string;
  examKind: ExamKind;
  examType: ExamType;
  createdAt: string;
  printEnabled: boolean;
};

export type ExamQuestionFilterOptions = {
  courses: Array<{ id: string; name: string; code: string }>;
  examKinds: ExamKind[];
  examTypes: ExamType[];
};
