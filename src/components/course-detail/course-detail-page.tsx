import { ActivitySection } from "@/components/course-detail/ActivitySection";
import { CareerSection } from "@/components/course-detail/CareerSection";
import { CertificateSection } from "@/components/course-detail/CertificateSection";
import { CourseDescription } from "@/components/course-detail/CourseDescription";
import { CourseGoal } from "@/components/course-detail/CourseGoal";
import { CourseHero } from "@/components/course-detail/CourseHero";
import { CourseInfo } from "@/components/course-detail/CourseInfo";
import { FAQSection } from "@/components/course-detail/FAQSection";
import { LecturePlan } from "@/components/course-detail/LecturePlan";
import { LicenseCard } from "@/components/course-detail/LicenseCard";
import { OrganizationInfo } from "@/components/course-detail/OrganizationInfo";
import { ProfessorSection } from "@/components/course-detail/ProfessorSection";
import { RequirementSection } from "@/components/course-detail/RequirementSection";
import { StickyEnrollCard } from "@/components/course-detail/StickyEnrollCard";
import { TargetSection } from "@/components/course-detail/TargetSection";
import type { CourseDetailData } from "@/components/course-detail/types";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { cn } from "@/lib/utils";

export function CourseDetailPage({ course }: { course: CourseDetailData }) {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <CourseHero
        slug={course.slug}
        title={course.title}
        ministry={course.ministry}
        badges={course.badges}
        originalPrice={course.originalPrice}
        price={course.price}
        ctaLabel={course.ctaLabel}
      />

      <main className="pb-20 lg:pb-0">
        <HomeContainer>
          <div className="grid gap-8 py-10 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="flex min-w-0 flex-col gap-12">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <CourseInfo info={course.info} />
                <LicenseCard license={course.license} />
              </div>

              <OrganizationInfo organization={course.organization} />
              <LecturePlan items={course.lecturePlan} />
              <CourseDescription description={course.description} />
              <CourseGoal goal={course.goal} />
              <ActivitySection items={course.activities} />
              <TargetSection targets={course.targets} />
              <CareerSection heading={course.career.heading} bullets={course.career.bullets} />
              <ProfessorSection professor={course.professor} />
              <CertificateSection samples={course.certificateSamples} note={course.certificateNote} />
              <RequirementSection requirements={course.requirements} notes={course.requirementNotes} />
              <FAQSection items={course.faq} />
            </div>

            <StickyEnrollCard slug={course.slug} sticky={course.sticky} />
          </div>
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
