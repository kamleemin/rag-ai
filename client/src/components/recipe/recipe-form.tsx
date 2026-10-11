"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SectionHeader from "@/components/recipe/section-header";
import MonoBadge from "@/components/recipe/mono-badge";
import EditableRowTable from "@/components/recipe/editable-row-table";
import CalorieSection from "@/components/recipe/calorie-section";
import { RECIPE_CATEGORIES } from "@rag-ai/shared";
import { cn } from "@/lib/utils";
import type { RecipeFormValues } from "@/types";
import { RECIPE_FORM_PLACEHOLDERS } from "./const";
import { useRecipeForm } from "./use-recipe-form";

const LABEL_CLASS = "mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase";
const FIELD_CLASS = "h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink";

/**
 * The one recipe form, shared by manual entry, the review screen after a video is
 * extracted, and editing a saved recipe. Holds its own state; the page passes starting
 * values in and gets the finished values back through onSubmit. Calories aren't typed in:
 * "Calculate calories" works them out from the ingredients, and saving keeps that result.
 */
export default function RecipeForm({
  initialValues = {},
  detected = false,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError = null,
}: {
  initialValues?: Partial<RecipeFormValues>;
  /** Values came from a video: blank fields get "not detected" hints and badges. */
  detected?: boolean;
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (values: RecipeFormValues) => void;
  /** Leave out to make the secondary button reset the form (e.g. "Clear form"). */
  onCancel?: () => void;
  /** While saving: the submit button is disabled and says "Saving…". */
  isSubmitting?: boolean;
  /** User-facing message when saving failed, shown above the buttons. */
  submitError?: string | null;
}) {
  const {
    rows,
    updateRow,
    removeRow,
    addRow,
    category,
    setCategory,
    isAddingCategory,
    toggleAddingCategory,
    title,
    setTitle,
    description,
    setDescription,
    servings,
    setServings,
    instructions,
    setInstructions,
    calorieDisplay,
    isCalorieEstimateOutdated,
    canCalculateCalories,
    isCalculatingCalories,
    calculateCaloriesErrorMessage,
    calculateCalories,
    reset,
    handleSubmit,
  } = useRecipeForm(initialValues, onSubmit);

  const placeholders = RECIPE_FORM_PLACEHOLDERS[detected ? "detected" : "manual"];
  const ingredientColumns = [
    { key: "name", label: "Name", placeholder: placeholders.ingredientName },
    { key: "amount", label: "Amount", placeholder: "—" },
    { key: "unit", label: "Unit", placeholder: "—" },
  ];

  return (
    <div>
      <SectionHeader step="01" label="Basic info" />
      <label className={LABEL_CLASS}>Recipe title</label>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholders.title}
        className={cn("mb-5", FIELD_CLASS)}
      />
      <div className="mb-2 flex items-center justify-between">
        <label className={cn(LABEL_CLASS, "mb-0")}>Short description</label>
        {detected && !description && <MonoBadge>NOT DETECTED</MonoBadge>}
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={placeholders.description}
        className={cn("mb-5 min-h-14", FIELD_CLASS, detected && "border border-dashed")}
      />
      {/* Total time isn't typed in — it comes from the video. */}
      <div className="mb-9 max-w-[220px]">
        <div>
          <label className={LABEL_CLASS}>Servings</label>
          <Input
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="—"
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <SectionHeader step="02" label="Ingredients" />
      <EditableRowTable
        rows={rows}
        columns={ingredientColumns}
        onChange={updateRow}
        onRemove={removeRow}
        onAdd={addRow}
        addLabel="+ Add ingredient"
      />
      <div className="mb-9" />

      <SectionHeader step="03" label="Instructions" />
      <Textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder={placeholders.instructions}
        className={cn("mb-9 min-h-[120px]", FIELD_CLASS)}
      />

      <SectionHeader step="04" label="Category" />
      <div className="mb-2.5 flex items-center gap-2.5">
        <Select value={category} onValueChange={(value) => value && setCategory(value)}>
          <SelectTrigger className={cn("flex-1", FIELD_CLASS)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECIPE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {detected && <MonoBadge variant="green">AUTO-SUGGESTED</MonoBadge>}
      </div>
      {isAddingCategory && (
        <Input placeholder="New category name" className={cn("mb-9", FIELD_CLASS)} />
      )}
      <button
        type="button"
        onClick={toggleAddingCategory}
        className="mb-9 block font-sans text-[13px] text-tan underline"
      >
        + Add new category
      </button>

      <CalorieSection
        step="05"
        calorieDisplay={calorieDisplay}
        isOutdated={isCalorieEstimateOutdated}
        canCalculate={canCalculateCalories}
        isCalculating={isCalculatingCalories}
        errorMessage={calculateCaloriesErrorMessage}
        onCalculate={calculateCalories}
      />

      {submitError && (
        <p role="alert" className="mb-3 text-[13px] text-red-600">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel ?? reset}
          className="font-sans text-[13px] text-tan underline"
        >
          {cancelLabel}
        </button>
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
