import { HOT_COURSES, NEW_COURSES, RECOMMENDED_COURSES } from "@/components/home/data/home-data";
import { BannerSection, ConsultBanner } from "@/components/home/BannerSection";
import { CategorySection } from "@/components/home/CategorySection";
import { CourseSection } from "@/components/home/CourseSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeHero } from "@/components/home/Hero";
import { NoticeCustomerSection } from "@/components/home/NoticeSection";
import { QuickMenu } from "@/components/home/QuickMenu";
import { figmaClass } from "@/components/home/home-design";
import { getStudentSessionMember } from "@/features/auth/services/student-login.service";
import { cn } from "@/lib/utils";

export async function HomePage() {
  const member = await getStudentSessionMember();

  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />
      <main>
        <HomeHero member={member} />
        <CategorySection />
        <CourseSection title="인기과정" courses={HOT_COURSES} bgClassName="bg-white" />
        <CourseSection title="신규과정" courses={NEW_COURSES} bgClassName="bg-white" />
        <BannerSection />
        <CourseSection title="추천과정" courses={RECOMMENDED_COURSES} bgClassName="bg-white" />
        <ConsultBanner />
        <NoticeCustomerSection />
        <FaqSection />
      </main>
      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
