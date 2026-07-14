import type { Metadata } from "next";

import { AssignmentListView } from "@/features/assignment-management/components/assignment-list-view";
import { parseAssignmentListQuery } from "@/features/assignment-management/lib/assignment-list-query";
import {
  getAssignmentFilterOptions,
  getAssignmentList,
} from "@/features/assignment-management/services/assignment-list.service";

export const metadata: Metadata = {
  title: "과제관리",
};

type AssignmentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssignmentsPage({ searchParams }: AssignmentsPageProps) {
  const params = await searchParams;
  const query = parseAssignmentListQuery(params);

  const [result, filterOptions] = await Promise.all([
    getAssignmentList(query),
    getAssignmentFilterOptions(),
  ]);

  return (
    <AssignmentListView result={result} query={query} filterOptions={filterOptions} />
  );
}
