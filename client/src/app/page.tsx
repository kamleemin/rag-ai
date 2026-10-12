"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MonoBadge from "@/components/recipe/mono-badge";
import { PATHNAMES } from "@/lib/pathnames";
import { SUGGESTION_CHIPS } from "./const";
import { useHomeSearch } from "./use-home-search";

export default function Home() {
  const {
    query,
    setQuery,
    handleAsk,
    askSuggestion,
    canAsk,
    isAsking,
    askedQuestion,
    askErrorMessage,
    answer,
    matchedRecipes,
  } = useHomeSearch();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-20 text-center">
      <h1 className="mb-3 font-serif text-[32px] font-semibold text-ink">
        What are you making today?
      </h1>
      <p className="mb-8 max-w-[460px] text-sm leading-relaxed text-body-text">
        Ask in plain language — search your saved recipes, or get ideas from what&apos;s on hand.
      </p>

      <form onSubmit={handleAsk} className="flex w-full max-w-[560px] gap-2.5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What can I make?"
          className="h-auto rounded-lg border-border bg-muted px-4.5 py-3.5 text-sm text-ink placeholder:text-tan"
        />
        <Button
          type="submit"
          disabled={!canAsk}
          className="h-auto rounded-lg bg-green px-5.5 py-3.5 text-sm font-semibold text-white hover:bg-green-hover"
        >
          {isAsking ? "Searching…" : "Ask"}
        </Button>
      </form>

      {/* The answer to the last question, with the saved recipes it came from. */}
      {(isAsking || askErrorMessage || answer) && (
        <div className="mt-6 w-full max-w-[560px] rounded-lg border border-border bg-white px-5 py-4 text-left">
          {askedQuestion && (
            <div className="mb-2 font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              {askedQuestion}
            </div>
          )}
          {isAsking && (
            <p className="text-sm text-tan">Searching your recipes — this takes a few seconds…</p>
          )}
          {!isAsking && askErrorMessage && (
            <p role="alert" className="text-[13px] text-red-600">
              {askErrorMessage}
            </p>
          )}
          {!isAsking && !askErrorMessage && answer && (
            <>
              <p className="text-sm leading-relaxed text-ink">{answer}</p>
              {matchedRecipes.length > 0 && (
                <>
                  {/* The recipes the answer picked as fitting the question. */}
                  <div className="mt-4 mb-1 font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
                    Your recipes
                  </div>
                  <ul className="divide-y divide-border border-t border-border">
                    {matchedRecipes.map((recipe) => (
                      <li key={recipe.id}>
                        <Link
                          href={recipe.href}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <span className="font-serif text-sm font-semibold text-ink">
                            {recipe.title}
                          </span>
                          <span className="flex items-center gap-2">
                            {recipe.category && (
                              <MonoBadge variant="green">{recipe.category}</MonoBadge>
                            )}
                            <span className="text-border">›</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-5 flex max-w-[560px] flex-wrap justify-center gap-2.5">
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => askSuggestion(chip)}
            disabled={isAsking}
            className="rounded-full border border-border bg-white px-3.5 py-2 font-sans text-[12.5px] text-body-text disabled:opacity-60"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-11 flex gap-6">
        <Link href={PATHNAMES.recipes} className="font-sans text-[13px] text-tan underline">
          Browse All Recipes →
        </Link>
        <Link href={PATHNAMES.addRecipe} className="font-sans text-[13px] text-tan underline">
          + Add a recipe
        </Link>
      </div>
    </main>
  );
}
