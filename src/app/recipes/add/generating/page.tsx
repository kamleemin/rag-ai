"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", label: "WATCHING VIDEO" },
  { n: "02", label: "EXTRACTING RECIPE" },
  { n: "03", label: "STRUCTURING DATA" },
];

const PHRASES = [
  "Watching the video…",
  "Extracting the recipe…",
  "Structuring the details…",
];

export default function GeneratingRecipePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) {
      const timeout = setTimeout(
        () => router.push("/recipes/add/review"),
        900 + 550
      );
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStepIndex((i) => i + 1), 900);
    return () => clearTimeout(timeout);
  }, [stepIndex, router]);

  const genPhrase = PHRASES[Math.min(stepIndex, PHRASES.length - 1)];

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-20">
      <div className="w-full max-w-[420px] text-center">
        <span className="font-mono text-[10px] tracking-[0.08em] text-tan">
          GENERATING RECIPE
        </span>
        <h2
          className="my-3.5 mb-10 bg-[length:200%_100%] bg-clip-text font-serif text-2xl font-semibold text-transparent italic"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #A08C78 0%, #3D6B4F 25%, #3B2A1A 50%, #3D6B4F 75%, #A08C78 100%)",
            animation: "kamasak-shimmer 2.4s linear infinite",
          }}
        >
          {genPhrase}
        </h2>
        <div className="flex flex-col gap-3.5 text-left">
          {STEPS.map((step, i) => {
            const status =
              i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
            const lineColor = status === "pending" ? "#DDD9D3" : "#3D6B4F";
            return (
              <div key={step.n} className="flex items-center gap-3">
                <span
                  className="w-4 flex-none font-mono text-[11px]"
                  style={{ color: lineColor }}
                >
                  {status === "done" ? "✓" : step.n}
                </span>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: lineColor }}
                />
                <span
                  className={cn(
                    "flex-none font-mono text-[11px] tracking-[0.06em]",
                    status === "active" && "text-ink",
                    status === "done" && "text-body-text",
                    status === "pending" && "text-tan"
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
