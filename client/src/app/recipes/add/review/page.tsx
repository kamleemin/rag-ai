"use client";

import Link from "next/link";
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
import PageHeader from "@/components/common/page-header";
import CalorieCard from "@/components/common/calorie-card";
import EditableRowTable from "@/components/recipe/editable-row-table";
import { recipeCategories } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { useReviewRecipeForm } from "./use-review-recipe-form";

const columns = [
  { key: "name", label: "Name", placeholder: "Not detected" },
  { key: "amount", label: "Amount", placeholder: "—" },
  { key: "unit", label: "Unit", placeholder: "—" },
];

export default function ReviewRecipePage() {
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
    prepMinutes,
    setPrepMinutes,
    cookMinutes,
    setCookMinutes,
    instructions,
    setInstructions,
    saveRecipe,
  } = useReviewRecipeForm();

  return (
    <main className="flex-1">
      <PageHeader backHref="/recipes/add" title="Review & Edit Recipe" />

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(61,107,79,0.2)] bg-green-tint-bg px-4.5 py-3.5">
          <span className="text-[13px] text-ink">
            Extracted from TikTok — check everything below before saving.
            Fields left blank couldn&apos;t be read from the video.
          </span>
          <a
            href="#"
            className="shrink-0 font-mono text-[11px] tracking-[0.05em] text-green"
          >
            SOURCE VIDEO ↗
          </a>
        </div>

        <SectionHeader step="01" label="Basic info" />
        <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
          Recipe title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Not detected — add a title manually."
          className="mb-5 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />
        <div className="mb-2 flex items-center justify-between">
          <label className="block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
            Short description
          </label>
          {!description && <MonoBadge>NOT DETECTED</MonoBadge>}
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Not detected in the video — add a note manually."
          className="mb-5 min-h-14 rounded-md border border-dashed border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />
        <div className="mb-9 grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Servings
            </label>
            <Input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="—"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Prep (min)
            </label>
            <Input
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              placeholder="—"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Cook (min)
            </label>
            <Input
              value={cookMinutes}
              onChange={(e) => setCookMinutes(e.target.value)}
              placeholder="—"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
        </div>

        <SectionHeader step="02" label="Ingredients" />
        <EditableRowTable
          rows={rows}
          columns={columns}
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
          placeholder="Not detected in the video — add steps manually."
          className="mb-9 min-h-[120px] rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />

        <SectionHeader step="04" label="Category" />
        <div className="mb-2.5 flex items-center gap-2.5">
          <Select
            value={category}
            onValueChange={(value) => value && setCategory(value)}
          >
            <SelectTrigger className="h-auto flex-1 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recipeCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MonoBadge variant="green">AUTO-SUGGESTED</MonoBadge>
        </div>
        {isAddingCategory && (
          <Input
            placeholder="New category name"
            className="mb-9 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
          />
        )}
        <button
          type="button"
          onClick={toggleAddingCategory}
          className="mb-9 block font-sans text-[13px] text-tan underline"
        >
          + Add new category
        </button>

        <SectionHeader step="05" label="Calories" />
        <div className="mb-8">
          <CalorieCard
            calories="≈ 640 kcal"
            badgeLabel="ESTIMATED"
            note="1 ingredient used a generic fallback value"
            right={
              <Link
                href={PATHNAMES.ingredients}
                className="font-sans text-[13px] text-tan underline"
              >
                Manage ingredient list →
              </Link>
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={PATHNAMES.addRecipe}
            className="font-sans text-[13px] text-tan underline"
          >
            Discard
          </Link>
          <button
            type="button"
            onClick={saveRecipe}
            className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
          >
            Save Recipe
          </button>
        </div>
      </div>
    </main>
  );
}
