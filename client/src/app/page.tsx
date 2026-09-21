"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { suggestionChips } from "@/lib/mock-data";
import { PATHNAMES } from "@/lib/pathnames";
import { useHomeSearch } from "./use-home-search";

export default function Home() {
  const { query, setQuery, handleAsk, handleInputKeyDown } = useHomeSearch();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-20 text-center">
      <h1 className="mb-3 font-serif text-[32px] font-semibold text-ink">
        What are you making today?
      </h1>
      <p className="mb-8 max-w-[460px] text-sm leading-relaxed text-body-text">
        Ask in plain language — search your saved recipes, or get ideas from
        what&apos;s on hand.
      </p>

      <form onSubmit={handleAsk} className="flex w-full max-w-[560px] gap-2.5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="I have chicken and spinach, what can I make?"
          className="h-auto rounded-lg border-border bg-muted px-4.5 py-3.5 text-sm text-ink placeholder:text-tan"
        />
        <Button
          type="submit"
          className="h-auto rounded-lg bg-green px-5.5 py-3.5 text-sm font-semibold text-white hover:bg-green-hover"
        >
          Ask
        </Button>
      </form>

      <div className="mt-5 flex max-w-[560px] flex-wrap justify-center gap-2.5">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setQuery(chip)}
            className="rounded-full border border-border bg-white px-3.5 py-2 font-sans text-[12.5px] text-body-text"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="mt-11 flex gap-6">
        <Link
          href={PATHNAMES.recipes}
          className="font-sans text-[13px] text-tan underline"
        >
          Browse All Recipes →
        </Link>
        <Link
          href={PATHNAMES.addRecipe}
          className="font-sans text-[13px] text-tan underline"
        >
          + Add a recipe
        </Link>
      </div>
    </main>
  );
}
