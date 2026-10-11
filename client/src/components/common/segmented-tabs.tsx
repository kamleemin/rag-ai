import { cn } from "@/lib/utils";

/** A row of joined tab buttons, e.g. FROM VIDEO | MANUAL ENTRY. */
export default function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex overflow-hidden rounded-lg border border-border", className)}>
      {tabs.map((tab, i) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.06em]",
            i > 0 && "border-l border-border",
            tab.value === value ? "bg-ink text-white" : "bg-white text-tan"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
