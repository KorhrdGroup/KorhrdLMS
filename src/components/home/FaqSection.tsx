import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FAQ_ITEMS, QUICK_LINK_ITEMS } from "@/components/home/data/home-data";
import { figma, figmaClass } from "@/components/home/home-design";
import { HomeContainer } from "@/components/home/home-container";
import { cn } from "@/lib/utils";

export function FaqSection() {
  return (
    <section className={figmaClass.pageBg} style={{ padding: `${figma.spacing.noticeSection}px 0` }}>
      <HomeContainer>
        <h2 className={cn(figma.typography.sectionTitle, "mb-5", figmaClass.textPrimary)}>
          이런게 궁금하셨죠?
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex min-h-[84px] items-center justify-between gap-3 border bg-white px-5 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00376e]/30 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]",
                  figmaClass.roundedCard,
                  figmaClass.borderDefault,
                )}
              >
                <span className={cn("line-clamp-2 text-[14px] font-medium", figmaClass.textBody)}>
                  {item.question}
                </span>
                {item.links ? (
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                    {item.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="inline-flex items-center gap-0.5 rounded-md border border-[#00376e]/20 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-[#00376e] transition-colors duration-200 hover:bg-[#e5edff]"
                      >
                        {link.label}
                        <ArrowRight className="size-3" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <ArrowRight
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                      figmaClass.textPlaceholder,
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid w-full grid-cols-2 gap-3 border bg-white p-5 sm:w-[300px] sm:shrink-0",
              figmaClass.roundedCard,
              figmaClass.borderDefault,
            )}
          >
            {QUICK_LINK_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center justify-center gap-2 rounded-lg py-4 text-center transition-all duration-200 hover:bg-[#e5edff]"
                >
                  <Icon
                    className="size-6 text-[#00376e] transition-transform duration-200 group-hover:scale-110"
                    strokeWidth={1.75}
                  />
                  <span className={cn("text-[13px] font-medium", figmaClass.textBody)}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </HomeContainer>
    </section>
  );
}
