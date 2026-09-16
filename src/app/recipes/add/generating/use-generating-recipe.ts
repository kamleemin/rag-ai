import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PATHNAMES } from "@/lib/pathnames";

export const GENERATING_STEPS = [
  { n: "01", label: "WATCHING VIDEO" },
  { n: "02", label: "EXTRACTING RECIPE" },
  { n: "03", label: "STRUCTURING DATA" },
];

const PHRASES = [
  "Watching the video…",
  "Extracting the recipe…",
  "Structuring the details…",
];

export function useGeneratingRecipe() {
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (stepIndex >= GENERATING_STEPS.length - 1) {
      const timeout = setTimeout(
        () => router.push(PATHNAMES.addRecipeReview),
        900 + 550
      );
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStepIndex((i) => i + 1), 900);
    return () => clearTimeout(timeout);
  }, [stepIndex, router]);

  const genPhrase = PHRASES[Math.min(stepIndex, PHRASES.length - 1)];

  return { stepIndex, genPhrase };
}

export function getStepStatus(index: number, stepIndex: number) {
  if (index < stepIndex) return "done" as const;
  if (index === stepIndex) return "active" as const;
  return "pending" as const;
}
