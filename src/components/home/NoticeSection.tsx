"use client";

import Link from "next/link";

import { CENTER_NEWS_ITEMS, NOTICE_ITEMS, type NoticeItem } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { CustomerCenter } from "@/components/home/CustomerCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function NoticeList({ items }: { items: NoticeItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href="#"
            className="flex items-center justify-between gap-4 rounded-md px-2 py-2.5 leading-[1.6] transition-colors duration-200 -mx-2 hover:bg-[#f4f8ff] hover:[&_.title]:text-[#00376e]"
          >
            <span className={cn("title line-clamp-1 text-[14px]", figmaClass.textBody)}>
              · {item.title}
            </span>
            <span className={cn("shrink-0 text-[13px]", figmaClass.textPlaceholder)}>{item.date}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function NoticeSection({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)} style={{ maxWidth: figma.layout.noticePanelWidth }}>
      <Tabs defaultValue="notice">
        <TabsList
          variant="line"
          className={cn("h-auto w-full justify-start gap-6 border-b p-0", figmaClass.borderDefault)}
        >
          <TabsTrigger
            value="notice"
            className="h-auto rounded-none border-0 px-0 pb-3 text-[16px] font-bold data-active:text-[#00376e] data-active:after:h-[2px] data-active:after:bg-[#00376e]"
          >
            공지사항
          </TabsTrigger>
          <TabsTrigger
            value="news"
            className="h-auto rounded-none border-0 px-0 pb-3 text-[16px] font-bold text-[#919191] data-active:text-[#00376e] data-active:after:h-[2px] data-active:after:bg-[#00376e]"
          >
            교육원소식
          </TabsTrigger>
        </TabsList>
        <TabsContent value="notice" className="pt-5">
          <NoticeList items={NOTICE_ITEMS} />
        </TabsContent>
        <TabsContent value="news" className="pt-5">
          <NoticeList items={CENTER_NEWS_ITEMS} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function NoticeCustomerSection() {
  return (
    <section className={figmaClass.whiteBg} style={{ padding: `${figma.spacing.noticeSection}px 0` }}>
      <HomeContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <NoticeSection />
          <CustomerCenter />
        </div>
      </HomeContainer>
    </section>
  );
}
