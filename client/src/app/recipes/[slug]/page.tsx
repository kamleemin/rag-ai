"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import SectionHeader from "@/components/recipe/section-header";
import MonoBadge from "@/components/recipe/mono-badge";
import PageHeader from "@/components/common/page-header";
import CalorieCard from "@/components/common/calorie-card";
import RecipeForm from "@/components/recipe/recipe-form";
import { RecipeDetailState } from "./const";
import { useRecipeDetail } from "./use-recipe-detail";

export default function RecipeDetailPage({
  params,
}: PageProps<"/recipes/[slug]">) {
  const { slug } = use(params);
  const detail = useRecipeDetail(slug);
  if (detail.state === RecipeDetailState.NotFound) {
    notFound();
  }
  if (detail.state === RecipeDetailState.Loading || detail.state === RecipeDetailState.Error) {
    return (
      <main className="flex-1">
        <PageHeader backHref="/recipes" title="Recipe" backTitle="All Recipes" />
        <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
          {detail.state === RecipeDetailState.Loading ? (
            <p className="text-sm text-tan">Loading recipe…</p>
          ) : (
            <p role="alert" className="text-[13px] text-red-600">
              {detail.errorMessage}
            </p>
          )}
        </div>
      </main>
    );
  }
  const {
    recipe,
    editing,
    title,
    initialValues,
    summary,
    ingredientLines,
    steps,
    caloriesLabel,
    calorieBadge,
    calorieNote,
    startEditing,
    cancelEditing,
    saveChanges,
    isSaving,
    saveErrorMessage,
  } = detail;

  return (
    <main className="flex-1">
      <PageHeader backHref="/recipes" title={title} backTitle="All Recipes" />

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        {editing && (
          <div className="mb-9">
            <RecipeForm
              initialValues={initialValues}
              submitLabel="Save changes"
              cancelLabel="Cancel"
              onSubmit={saveChanges}
              onCancel={cancelEditing}
              isSubmitting={isSaving}
              submitError={saveErrorMessage}
            />
          </div>
        )}

        {!editing && (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              {recipe.category && (
                <MonoBadge variant="green">{recipe.category.toUpperCase()}</MonoBadge>
              )}
              <span className="text-[13px] text-tan-tint-text">{summary}</span>
            </div>
            {recipe.description && (
              <p className="mb-8 text-sm leading-relaxed text-body-text">
                {recipe.description}
              </p>
            )}

            <SectionHeader step="INGREDIENTS" label="" />
            <ul className="mb-8 list-none space-y-0 text-sm leading-[2] text-ink">
              {ingredientLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>

            <SectionHeader step="INSTRUCTIONS" label="" />
            <ol className="mb-8 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <div className="mb-9">
              <CalorieCard
                calories={caloriesLabel}
                badgeLabel={calorieBadge.label}
                badgeVariant={calorieBadge.variant}
                right={
                  <span className="text-xs text-tan-tint-text">
                    {calorieNote}
                  </span>
                }
              />
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
                onClick={startEditing}
                className="rounded-md border border-border bg-transparent px-6 py-3 font-sans text-sm font-semibold text-ink"
              >
                Edit recipe
              </button>
            </div>
          </>
        )}


      </div>
    </main>
  );
}
