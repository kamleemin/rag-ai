"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { mockRecipes, recipeCategories } from "@/lib/mock-data";

export default function RecipeDetailPage({
  params,
}: PageProps<"/recipes/[id]">) {
  const { id } = use(params);
  const recipe = mockRecipes.find((r) => r.id === id);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [servings, setServings] = useState(String(recipe?.servings ?? ""));
  const [ingredientsText, setIngredientsText] = useState(
    recipe?.ingredients.join("\n") ?? ""
  );
  const [instructionsText, setInstructionsText] = useState(
    recipe?.instructions
      .map((step, i) => `${i + 1}. ${step}`)
      .join("\n") ?? ""
  );
  const [category, setCategory] = useState(
    recipe?.category ?? recipeCategories[0]
  );
  const [tagsText, setTagsText] = useState(recipe?.tags.join(", ") ?? "");

  if (!recipe) notFound();

  return (
    <main className="flex-1">
      <div className="flex flex-wrap items-center gap-4 border-b border-border bg-white px-5 py-6 sm:px-10">
        <Link
          href="/recipes"
          className="flex items-center gap-1.5 font-sans text-[13px] text-tan"
        >
          ← Back
        </Link>
        <div className="h-8 w-px bg-border" />
        <h1 className="font-serif text-2xl font-semibold text-ink">
          {recipe.title}
        </h1>
      </div>

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        {editing && (
          <div>
            <SectionHeader step="01" label="Basic info" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Recipe title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-5 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Short description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-5 min-h-16 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
            <div className="mb-3 grid max-w-[220px] grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
                  Servings
                </label>
                <Input
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
                />
              </div>
            </div>
            <p className="mb-9 text-xs text-tan">
              Prep and cook time aren&apos;t entered here — they&apos;re
              estimated automatically, and you can adjust them yourself
              anytime after.
            </p>

            <SectionHeader step="02" label="Ingredients" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              One per line — include quantity and unit
            </label>
            <Textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              className="mb-9 min-h-[120px] rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <SectionHeader step="03" label="Instructions" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Step-by-step — number each step
            </label>
            <Textarea
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="mb-9 min-h-[120px] rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <SectionHeader step="04" label="Category" />
            <Select
              value={category}
              onValueChange={(value) => value && setCategory(value)}
            >
              <SelectTrigger className="mb-9 h-auto w-full rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink">
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

            <SectionHeader step="05" label="Tags" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Comma-separated — used for RAG retrieval
            </label>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="mb-8 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="font-sans text-[13px] text-tan underline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
              >
                Save changes
              </button>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <MonoBadge variant="green">{recipe.category.toUpperCase()}</MonoBadge>
          <span className="text-[13px] text-tan-tint-text">
            Serves {recipe.servings} · {recipe.prepMinutes} min prep ·{" "}
            {recipe.cookMinutes} min cook
          </span>
        </div>
        <p className="mb-8 text-sm leading-relaxed text-body-text">
          {recipe.description}
        </p>

        <SectionHeader step="INGREDIENTS" label="" />
        <ul className="mb-8 list-none space-y-0 text-sm leading-[2] text-ink">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        <SectionHeader step="INSTRUCTIONS" label="" />
        <ol className="mb-8 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink">
          {recipe.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="mb-9 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-white px-5.5 py-4.5">
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-xl font-semibold text-ink">
              {recipe.calories}
            </span>
            <MonoBadge variant={recipe.calorieConfidence === "exact" ? "green" : "tan"}>
              {recipe.calorieConfidence === "exact" ? "EXACT" : "ESTIMATED"}
            </MonoBadge>
          </div>
          <span className="text-xs text-tan-tint-text">{recipe.calorieNote}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            className="font-sans text-[13px] text-ink underline"
          >
            Delete recipe
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-md border border-border bg-transparent px-6 py-3 font-sans text-sm font-semibold text-ink"
          >
            Edit recipe
          </button>
        </div>
      </div>
    </main>
  );
}
