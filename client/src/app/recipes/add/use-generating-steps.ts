import { useEffect, useState } from "react";

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

const STEP_DURATION_MS = 1800;

/**
 * The real extraction call is a single opaque HTTP request, so there's no
 * server-driven progress to reflect — this just cycles through cosmetic
 * steps for as long as this component stays mounted (i.e. the mutation is
 * pending), and holds on the last step rather than claiming to be "done"
 * before it is.
 */
export function useGeneratingSteps() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, GENERATING_STEPS.length - 1));
    }, STEP_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  const genPhrase = PHRASES[Math.min(stepIndex, PHRASES.length - 1)];

  return { stepIndex, genPhrase };
}

export function getStepStatus(index: number, stepIndex: number) {
  if (index < stepIndex) return "done" as const;
  if (index === stepIndex) return "active" as const;
  return "pending" as const;
}
