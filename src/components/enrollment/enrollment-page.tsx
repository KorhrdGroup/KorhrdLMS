"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { EnrollmentCourseCard } from "@/components/enrollment/EnrollmentCourseCard";
import { EnrollmentFloatingBar } from "@/components/enrollment/EnrollmentFloatingBar";
import { EnrollmentSidebar } from "@/components/enrollment/EnrollmentSidebar";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figma, figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { applyForCourseAction } from "@/features/enrollment-catalog/actions/enrollment-application.actions";
import { ENROLLMENT_CATALOG_ALL_CATEGORY_ID } from "@/features/enrollment-catalog/constants";
import type {
  EnrollmentCatalogCategory,
  EnrollmentCatalogCourse,
} from "@/features/enrollment-catalog/types/enrollment-catalog.types";
import { cn } from "@/lib/utils";

export function EnrollmentPage({
  courses,
  categories,
  initialSelectedSlug,
  isLoggedIn,
  loadError,
}: {
  courses: EnrollmentCatalogCourse[];
  categories: EnrollmentCatalogCategory[];
  initialSelectedSlug?: string;
  isLoggedIn: boolean;
  loadError?: string;
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(ENROLLMENT_CATALOG_ALL_CATEGORY_ID);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, startSubmitTransition] = useTransition();

  useEffect(() => {
    if (!initialSelectedSlug) return;
    const matched = courses.find((course) => course.slug === initialSelectedSlug);
    if (!matched) return;
    setSelectedIds((prev) => (prev.includes(matched.id) ? prev : [...prev, matched.id]));
  }, [initialSelectedSlug, courses]);

  const activeCategoryLabel =
    categories.find((c) => c.id === activeCategory)?.label ?? "전체과정";

  const filteredCourses = useMemo(
    () =>
      activeCategory === ENROLLMENT_CATALOG_ALL_CATEGORY_ID
        ? courses
        : courses.filter((course) => course.categoryId === activeCategory),
    [activeCategory, courses],
  );

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedIds.includes(course.id)),
    [courses, selectedIds],
  );

  const toggleCourse = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const removeCourse = (id: string) => {
    setSelectedIds((prev) => prev.filter((v) => v !== id));
  };

  const handleSubmit = () => {
    if (selectedCourses.length === 0 || isSubmitting) return;

    if (!isLoggedIn) {
      const wantsSignup = window.confirm(
        "수강신청을 위해서 교육원 회원가입이 필요합니다.\n회원가입을 하시겠습니까?",
      );
      if (wantsSignup) {
        router.push("/signup");
      }
      return;
    }

    const targets = selectedCourses;

    startSubmitTransition(async () => {
      const attempts = await Promise.all(
        targets.map(async (course) => {
          const result = await applyForCourseAction({ courseId: course.id });

          return { course, result };
        }),
      );

      const succeeded = attempts.filter(
        (attempt): attempt is (typeof attempts)[number] & { result: { success: true } } =>
          attempt.result.success,
      );
      const failed = attempts.filter(
        (attempt): attempt is (typeof attempts)[number] & { result: { success: false } } =>
          !attempt.result.success,
      );

      if (failed.length === 0) {
        window.alert("수강신청이 완료되었습니다.");
      } else {
        const detail = failed
          .map((attempt) => `- ${attempt.course.title}: ${attempt.result.message}`)
          .join("\n");

        window.alert(
          succeeded.length > 0
            ? `${succeeded.length}개 과목 수강신청이 완료되었습니다.\n\n아래 과목은 신청되지 않았습니다.\n${detail}`
            : `수강신청에 실패했습니다.\n${detail}`,
        );
      }

      if (succeeded.length > 0) {
        const succeededIds = new Set(succeeded.map((attempt) => attempt.course.id));
        setSelectedIds((prev) => prev.filter((id) => !succeededIds.has(id)));
        router.refresh();
      }
    });
  };

  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <main className={cn(selectedCourses.length > 0 ? "pb-28" : "pb-2")}>
        <HomeContainer className="pt-4">
          <nav
            className={cn("mb-4 flex items-center gap-1.5 text-[13px]", figmaClass.textPlaceholder)}
            aria-label="breadcrumb"
          >
            <Link href="/" className="flex items-center hover:text-[#00376e]">
              <Home className="size-3.5" />
            </Link>
            <ChevronRight className="size-3.5" />
            <span className={figmaClass.textSub}>수강신청</span>
          </nav>

          <div
            className="relative mb-6 flex items-center overflow-hidden rounded-[10px] px-7 py-7 sm:px-9"
            style={{ backgroundColor: figma.colors.primary }}
          >
            <div className="relative z-10">
              <h1 className="text-[22px] font-bold text-white sm:text-[26px]">국가지정기관 정식등록 자격증</h1>
              <p className="mt-1.5 text-[13px] text-white/70">
                한평생 직업훈련센터의 국가지정기관 자격취득과정을 확인해보세요!
              </p>
            </div>
            <div className="relative ml-auto hidden size-[64px] shrink-0 sm:block">
              <Image src="/images/home/ic-specup.png" alt="" fill className="object-contain" />
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <EnrollmentSidebar
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            <div className="min-w-0 flex-1">
              <h2 className={cn(figma.typography.sectionTitle, "mb-4", figmaClass.textPrimary)}>
                {activeCategoryLabel}
              </h2>

              {loadError ? (
                <p className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                  {loadError}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredCourses.map((course) => (
                    <EnrollmentCourseCard
                      key={course.id}
                      course={course}
                      selected={selectedIds.includes(course.id)}
                      onToggle={() => toggleCourse(course.id)}
                    />
                  ))}
                  {filteredCourses.length === 0 ? (
                    <p className={cn("py-16 text-center text-[14px]", figmaClass.textPlaceholder)}>
                      해당 카테고리에 신청 가능한 과정이 아직 없습니다.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />

      <EnrollmentFloatingBar
        courses={selectedCourses}
        onRemove={removeCourse}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
      />
    </div>
  );
}
