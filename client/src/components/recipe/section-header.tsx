export default function SectionHeader({
  step,
  label,
}: {
  step: string;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="flex-none font-mono text-[11px] text-tan">{step}</span>
      <div
        className="h-px flex-1"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--border) 0, var(--border) 3px, transparent 3px, transparent 6px)",
        }}
      />
      <span className="flex-none font-mono text-[11px] tracking-[0.08em] text-tan uppercase">
        {label}
      </span>
    </div>
  );
}
