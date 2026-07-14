import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { COURSE_DETAIL_MOCK, getCourseDetail } from "@/components/course-detail/data/course-detail-data";
import { CourseDetailPage } from "@/components/course-detail/course-detail-page";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(COURSE_DETAIL_MOCK).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = COURSE_DETAIL_MOCK[slug];
  return {
    title: course ? course.title : "과정 상세",
    description: course ? course.description.body.slice(0, 80) : undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  if (!COURSE_DETAIL_MOCK[slug]) {
    notFound();
  }
  const course = getCourseDetail(slug);
  return <CourseDetailPage course={course} />;
}
