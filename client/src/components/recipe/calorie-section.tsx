import SectionHeader from "@/components/recipe/section-header";
import CalorieCard from "@/components/common/calorie-card";
import { cn } from "@/lib/utils";
import CalorieFixPanel from "./calorie-fix-panel";
import type { useCalorieEstimate } from "./use-calorie-estimate";

type CalorieDisplay = NonNullable<ReturnType<typeof useCalorieEstimate>["calorieDisplay"]>;

/** RecipeForm's calories step: the "Calculate calories" button, the total, and each ingredient's kcal. */
export default function CalorieSection({
  step,
  calorieDisplay,
  isOutdated,
  canCalculate,
  isCalculating,
  errorMessage,
  onCalculate,
  fixingLineIndex,
  onStartFix,
  onCloseFix,
  onFixSaved,
}: {
  step: string;
  calorieDisplay: CalorieDisplay | null;
  isOutdated: boolean;
  canCalculate: boolean;
  isCalculating: boolean;
  errorMessage: string | null;
  onCalculate: () => void;
  /** The line whose "Change" / "Find it" panel is open. */
  fixingLineIndex: number | null;
  onStartFix: (index: number) => void;
  onCloseFix: () => void;
  onFixSaved: () => void;
}) {
  const calculateButton = (
    <button
      type="button"
      onClick={onCalculate}
      disabled={!canCalculate}
      className="shrink-0 rounded-md border border-border bg-transparent px-4 py-2.5 font-sans text-[13px] font-semibold text-ink disabled:opacity-60"
    >
      {isCalculating ? "Calculating…" : "Calculate calories"}
    </button>
  );

  return (
    <div className="mb-9">
      <SectionHeader step={step} label="Calories" />
      {calorieDisplay ? (
        <>
          <div className={cn(isOutdated && "opacity-60")}>
            <CalorieCard
              calories={calorieDisplay.caloriesLabel}
              badgeLabel={calorieDisplay.badge.label}
              badgeVariant={calorieDisplay.badge.variant}
              perServing={calorieDisplay.perServingLabel}
              note={calorieDisplay.note}
              right={calculateButton}
            />
          </div>
          {isOutdated && (
            <p className="mt-2.5 text-xs text-tan">
              The ingredients changed since this was calculated — calculate again, or the
              recipe is saved without calories.
            </p>
          )}
          <ul className={cn("mt-3 space-y-2", isOutdated && "opacity-60")}>
            {calorieDisplay.lines.map((line, i) => (
              <li key={i} className="text-[13px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-ink">{line.ingredient}</div>
                    {line.detail && (
                      <div
                        className={cn(
                          "text-xs",
                          line.needsValue ? "text-tan" : "text-tan-tint-text"
                        )}
                      >
                        {line.detail}
                        {line.fixLabel && fixingLineIndex !== i && (
                          <>
                            {" · "}
                            <button
                              type="button"
                              onClick={() => onStartFix(i)}
                              disabled={isCalculating}
                              className="text-green underline disabled:opacity-60"
                            >
                              {line.fixLabel}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-ink">{line.kcalLabel}</span>
                </div>
                {fixingLineIndex === i && (
                  <CalorieFixPanel
                    ingredientName={line.name}
                    onSaved={onFixSaved}
                    onClose={onCloseFix}
                  />
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-border px-5.5 py-4.5">
          <span className="text-[13px] text-body-text">
            Not calculated yet — worked out from the ingredients above.
          </span>
          {calculateButton}
        </div>
      )}
      {errorMessage && (
        <p role="alert" className="mt-2.5 text-[13px] text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
