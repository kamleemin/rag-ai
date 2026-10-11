"use client";

import { IngredientSource } from "@rag-ai/shared";
import { Input } from "@/components/ui/input";
import SuffixInput from "@/components/common/suffix-input";
import { cn } from "@/lib/utils";
import type { IngredientFormValues, IngredientRequest } from "@/types";
import { NUTRIENT_FIELDS } from "./const";
import { useIngredientForm } from "./use-ingredient-form";
import { openFoodFactsProductUrl } from "./utils";

const LABEL_CLASS = "mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase";
const FIELD_CLASS = "h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink";

/** Name, brand and nutrition per 100 g — for typing an ingredient in, an import, or an edit. */
export default function IngredientForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: {
  initialValues: IngredientFormValues;
  submitLabel: string;
  onSubmit: (ingredient: IngredientRequest) => void;
  /** Leave out when there's nothing to cancel (an empty "type it in" form). */
  onCancel?: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const { values, setField, validationError, handleSubmit } = useIngredientForm(
    initialValues,
    onSubmit
  );
  const errorMessage = validationError ?? submitError;
  const importedCode =
    values.source === IngredientSource.OpenFoodFacts ? values.openFoodFactsCode : null;

  return (
    <div>
      {importedCode && (
        <p className="mb-4 text-xs text-body-text">
          From Open Food Facts —{" "}
          <a
            href={openFoodFactsProductUrl(importedCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green underline"
          >
            view product ↗
          </a>
          . Rename it to how your recipes write it (e.g. &quot;Bread flour&quot;) — recipes
          find ingredients by name.
        </p>
      )}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS}>Name *</label>
          <Input
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Bread flour"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Brand</label>
          <Input
            value={values.brand}
            onChange={(e) => setField("brand", e.target.value)}
            placeholder="e.g. Prima"
            className={FIELD_CLASS}
          />
        </div>
      </div>
      <div className="mb-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {NUTRIENT_FIELDS.map(({ key, label, suffix }) => (
          <div key={key}>
            <label className={LABEL_CLASS}>{label}</label>
            <SuffixInput
              suffix={suffix}
              inputMode="decimal"
              value={values[key]}
              onChange={(e) => setField(key, e.target.value)}
              placeholder="—"
              className={FIELD_CLASS}
            />
          </div>
        ))}
      </div>
      <p className="mb-5 text-[11px] text-tan">
        Labels differ on fibre: US labels count it inside carbs, EU/UK labels list it
        separately. Enter what the label says.
      </p>

      {errorMessage && (
        <p role="alert" className="mb-3 text-[13px] text-red-600">
          {errorMessage}
        </p>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center gap-4",
          onCancel ? "justify-between" : "justify-end"
        )}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-[13px] text-tan underline"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
