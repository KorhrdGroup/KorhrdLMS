import type { Metadata } from "next";

import { ExamListView } from "@/features/exam-management/components/exam-list-view";
import { parseExamListQuery } from "@/features/exam-management/lib/exam-list-query";
import {
  getExamFilterOptions,
  getExamList,
} from "@/features/exam-management/services/exam-list.service";

export const metadata: Metadata = {
  title: "시험관리",
};

type ExamsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExamsPage({ searchParams }: ExamsPageProps) {
  const params = await searchParams;
  const query = parseExamListQuery(params);

  const [result, filterOptions] = await Promise.all([
    getExamList(query),
    getExamFilterOptions(),
  ]);

  return <ExamListView result={result} query={query} filterOptions={filterOptions} />;
}
