import Link from "next/link";

import { figma, figmaClass } from "@/components/home/home-design";
import { NoticePagination } from "@/components/notice/NoticePagination";
import type { ClassroomMaterialItem } from "@/features/classroom-materials/types/classroom-material.types";
import { cn } from "@/lib/utils";

export function MaterialListBoard({
  slug,
  materials,
}: {
  slug: string;
  materials: ClassroomMaterialItem[];
}) {
  return (
    <div className="min-w-0 flex-1">
      <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>학습자료실</h2>

      <div className={cn("overflow-x-auto border", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <table className="w-full min-w-[480px] text-[14px]">
          <thead>
            <tr className="border-b bg-[#f7f8fa]" style={{ borderColor: figma.colors.border }}>
              <th className="w-[80px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">번호</th>
              <th className="py-3 pl-4 text-left text-[13px] font-semibold text-[#3d3d3d]">내용</th>
              <th className="w-[120px] py-3 text-center text-[13px] font-semibold text-[#3d3d3d]">작성자</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => (
              <tr
                key={material.id}
                className="border-b transition-colors duration-200 last:border-0 hover:bg-[#f4f8ff]"
                style={{ borderColor: figma.colors.border }}
              >
                <td className={cn("py-3.5 text-center", figmaClass.textPlaceholder)}>
                  <Link href={`/classroom/${slug}/materials/${material.id}`} className="block">
                    {material.seq}
                  </Link>
                </td>
                <td className="py-3.5 pl-4">
                  <Link
                    href={`/classroom/${slug}/materials/${material.id}`}
                    className={cn(
                      "flex items-center gap-2 transition-colors duration-200 hover:text-[#00376e] hover:underline",
                      figmaClass.textBody,
                    )}
                  >
                    {material.isCommon ? (
                      <span className="shrink-0 rounded bg-[#e5edff] px-1.5 py-0.5 text-[11px] font-semibold text-[#00376e]">
                        공통
                      </span>
                    ) : null}
                    {material.title}
                  </Link>
                </td>
                <td className={cn("py-3.5 text-center text-[13px]", figmaClass.textBody)}>{material.createdBy}</td>
              </tr>
            ))}
            {materials.length === 0 ? (
              <tr>
                <td colSpan={3} className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                  등록된 자료가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <NoticePagination currentPage={1} totalPages={1} />
    </div>
  );
}
