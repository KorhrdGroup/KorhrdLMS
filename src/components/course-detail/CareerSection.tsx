import { figma } from "@/components/home/home-design";

export function CareerSection({ heading, bullets }: { heading: string; bullets: string[] }) {
  return (
    <div className="rounded-[10px] px-6 py-8 text-white sm:px-10" style={{ backgroundColor: figma.colors.primary }}>
      <h2 className="text-center text-[22px] font-bold">{heading}</h2>
      <ul className="mx-auto mt-5 max-w-xl space-y-2 text-[14px] leading-relaxed text-white/85">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span className="text-white/50">-</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
