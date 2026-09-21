import { cn } from "@/lib/utils";

const variantClasses = {
  tan: "bg-tan-tint-bg text-tan-tint-text",
  green: "bg-green-tint-bg text-green",
} as const;

export default function MonoBadge({
  children,
  variant = "tan",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[9px] tracking-[0.05em] whitespace-nowrap",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
