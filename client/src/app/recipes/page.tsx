"use client";

import Link from "next/link";
import MonoBadge from "@/components/recipe/mono-badge";
import { PATHNAMES } from "@/lib/pathnames";
import { useAllRecipes } from "./use-all-recipes";

export default function AllRecipesPage() {
  const { isLoading, errorMessage, items } = useAllRecipes();

  return (
    <main className="flex-1">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-white px-5 py-6 sm:px-10">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          All Recipes
        </h1>
        <Link
          href={PATHNAMES.addRecipe}
          className="rounded-md bg-green px-4.5 py-2.5 font-sans text-[13px] font-semibold text-white transition-colors hover:bg-green-hover"
        >
          + Add Recipe
        </Link>
      </div>

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        {isLoading && <p className="text-sm text-tan">Loading recipes…</p>}
        {errorMessage && (
          <p role="alert" className="text-[13px] text-red-600">
            {errorMessage}
          </p>
        )}
        {!isLoading && !errorMessage && (
          <div className="mb-2 font-mono text-[11px] tracking-[0.06em] text-tan">
            {items.length} RECIPES
          </div>
        )}
        {items.map(
          ({
            id,
            href,
            title,
            description,
            category,
            caloriesLabel,
            perServingLabel,
          }) => (
            <Link
              key={id}
              href={href}
              className="flex items-center justify-between gap-4 border-b border-[#EFEDE7] px-1 py-4.5"
            >
              <div className="min-w-0">
                <div className="mb-1.5 font-serif text-base font-semibold text-ink">
                  {title}
                </div>
                {description && (
                  <p className="mb-2 line-clamp-2 text-[13px] leading-relaxed text-body-text">
                    {description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2.5">
                  {category && (
                    <MonoBadge variant="green">{category}</MonoBadge>
                  )}
                  <span className="text-xs text-tan-tint-text">
                    {caloriesLabel}
                  </span>
                  {perServingLabel && (
                    <span className="text-xs text-tan-tint-text">
                      · {perServingLabel}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-lg text-border">›</span>
            </Link>
          ),
        )}
      </div>
    </main>
  );
}
