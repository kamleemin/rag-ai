import type { ReactNode } from "react";
import MonoBadge from "@/components/recipe/mono-badge";

export default function CalorieCard({
  topLabel,
  calories,
  badgeLabel,
  badgeVariant = "tan",
  note,
  right,
}: {
  topLabel?: string;
  calories: string;
  badgeLabel: string;
  badgeVariant?: "tan" | "green";
  note?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-white px-5.5 py-4.5">
      <div>
        {topLabel && (
          <div className="mb-1.5 font-mono text-[10px] tracking-[0.06em] text-tan">
            {topLabel}
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-xl font-semibold text-ink">
            {calories}
          </span>
          <MonoBadge variant={badgeVariant}>{badgeLabel}</MonoBadge>
        </div>
        {note && <div className="mt-1.5 text-xs text-body-text">{note}</div>}
      </div>
      {right}
    </div>
  );
}
