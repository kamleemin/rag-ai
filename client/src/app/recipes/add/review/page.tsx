"use client";

import PageHeader from "@/components/common/page-header";
import RecipeForm from "@/components/recipe/recipe-form";
import { PATHNAMES } from "@/lib/pathnames";
import { useReviewRecipeForm } from "./use-review-recipe-form";

export default function ReviewRecipePage() {
  const { initialValues, sourceUrl, saveRecipe, isSaving, saveErrorMessage, discardRecipe } =
    useReviewRecipeForm();

  return (
    <main className="flex-1">
      <PageHeader backHref={PATHNAMES.addRecipe} title="Review & Edit Recipe" />

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[rgba(61,107,79,0.2)] bg-green-tint-bg px-4.5 py-3.5">
          <span className="text-[13px] text-ink">
            Extracted from TikTok — check everything below before saving.
            Fields left blank couldn&apos;t be read from the video.
          </span>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-mono text-[11px] tracking-[0.05em] text-green"
            >
              SOURCE VIDEO ↗
            </a>
          )}
        </div>

        <RecipeForm
          detected
          initialValues={initialValues}
          submitLabel="Save Recipe"
          cancelLabel="Discard"
          onSubmit={saveRecipe}
          isSubmitting={isSaving}
          submitError={saveErrorMessage}
          onCancel={discardRecipe}
        />
      </div>
    </main>
  );
}
