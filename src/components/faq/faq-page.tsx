import { HomeFooter } from "@/components/home/Footer";
import { HomeHeader } from "@/components/home/Header";
import { HomeContainer } from "@/components/home/home-container";
import { figmaClass } from "@/components/home/home-design";
import { QuickMenu } from "@/components/home/QuickMenu";
import { FaqBoard } from "@/components/faq/FaqBoard";
import { NoticeHero } from "@/components/notice/NoticeHero";
import { NoticeSidebar } from "@/components/notice/NoticeSidebar";
import { cn } from "@/lib/utils";

export function FaqPage() {
  return (
    <div className={cn("min-h-screen", figmaClass.pageBg)}>
      <HomeHeader />

      <main className="pb-16">
        <HomeContainer className="pt-4">
          <NoticeHero currentLabel="자주하는 질문" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <NoticeSidebar />
            <FaqBoard />
          </div>
        </HomeContainer>
      </main>

      <HomeFooter />
      <QuickMenu />
    </div>
  );
}
