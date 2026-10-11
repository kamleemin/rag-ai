import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** An input with its unit shown inside on the right, e.g. "367 | kcal/100g". */
export default function SuffixInput({
  suffix,
  className,
  ...props
}: ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className="relative">
      <Input {...props} className={cn("pr-20", className)} />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-[10px] text-tan">
        {suffix}
      </span>
    </div>
  );
}
