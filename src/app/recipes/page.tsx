import Link from "next/link";
import MonoBadge from "@/components/recipe/mono-badge";
import { mockRecipes } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";

export default function AllRecipesPage() {
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
        <div className="mb-2 font-mono text-[11px] tracking-[0.06em] text-tan">
          {mockRecipes.length} RECIPES
        </div>
        {mockRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="flex items-center justify-between gap-4 border-b border-[#EFEDE7] px-1 py-4.5"
          >
            <div>
              <div className="mb-1.5 font-serif text-base font-semibold text-ink">
                {recipe.title}
              </div>
              <div className="flex items-center gap-2.5">
                <MonoBadge variant="green">{recipe.category}</MonoBadge>
                <span className="text-xs text-tan-tint-text">
                  {recipe.calories}
                </span>
              </div>
            </div>
            <span className="text-lg text-border">›</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
