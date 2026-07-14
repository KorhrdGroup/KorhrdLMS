import type { Metadata } from "next";

import { MaterialListView } from "@/features/learning-materials/components/material-list-view";
import { parseMaterialListQuery } from "@/features/learning-materials/lib/material-list-query";
import {
  getMaterialFilterOptions,
  getMaterialList,
} from "@/features/learning-materials/services/material-list.service";

export const metadata: Metadata = {
  title: "자료실",
};

type LearningMaterialsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LearningMaterialsPage({
  searchParams,
}: LearningMaterialsPageProps) {
  const params = await searchParams;
  const query = parseMaterialListQuery(params);

  const [result, filterOptions] = await Promise.all([
    getMaterialList(query),
    getMaterialFilterOptions(),
  ]);

  return (
    <MaterialListView result={result} query={query} filterOptions={filterOptions} />
  );
}
