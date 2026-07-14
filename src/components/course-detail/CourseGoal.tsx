import { figmaClass } from "@/components/home/home-design";
import { cn } from "@/lib/utils";

export function CourseGoal({ goal }: { goal: string }) {
  return (
    <div>
      <h2 className={cn("mb-3 text-center text-[20px] font-bold", figmaClass.textPrimary)}>강좌목표</h2>
      <div className={cn("rounded-lg border bg-[#f7f8fa] p-5", figmaClass.borderDefault)}>
        <p className={cn("text-center text-[14px] leading-relaxed", figmaClass.textBody)}>{goal}</p>
      </div>
    </div>
  );
}
