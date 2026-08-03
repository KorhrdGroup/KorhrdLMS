import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseDetailView } from "@/features/course-detail/components/course-detail-view";
import { getCourseDetail } from "@/features/course-detail/services/course-detail.service";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * slug는 과정 코드(`courses.code`, 예: CRS-KH-0038)입니다.
 * 수강신청 카탈로그(enrollment-catalog)가 같은 값으로 링크를 만듭니다.
 *
 * 어드민에서 상세페이지 내용을 고치면 즉시 반영돼야 하므로 미리 생성하지 않고
 * 요청 시점에 DB에서 읽습니다.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(slug);
  if (!course) return { title: "과정 상세" };

  return {
    title: `${course.title} — 한평생 직업훈련`,
    description: course.description.body.slice(0, 120) || undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseDetail(slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      {/* 퍼블리싱 산출물의 디자인 시스템. 이 라우트에서만 불러옵니다. */}
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/course-detail/css/style.css" />
      <CourseDetailView course={course} />
    </>
  );
}
