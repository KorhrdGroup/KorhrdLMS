import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItemData } from "@/components/course-detail/types";
import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function FAQSection({ items }: { items: FaqItemData[] }) {
  return (
    <div>
      <h2 className={cn("mb-3 text-[18px] font-bold", figmaClass.textPrimary)}>FAQ</h2>
      <div className={cn("border px-4", figmaClass.roundedCard, figmaClass.borderDefault)}>
        <Accordion>
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#e0e0e0]">
              <AccordionTrigger className={cn("py-4 text-[14px] font-semibold", figmaClass.textBody)}>
                <span className="mr-2 text-[#00376e]">Q.</span>
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className={cn("text-[13px] leading-relaxed whitespace-pre-line", figmaClass.textMuted)}>
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
