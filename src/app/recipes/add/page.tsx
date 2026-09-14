"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { recipeCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Tab = "video" | "manual";

export default function AddRecipePage() {
  const [tab, setTab] = useState<Tab>("video");
  const [addingCategory, setAddingCategory] = useState(false);
  const [category, setCategory] = useState(recipeCategories[0]);
  const router = useRouter();

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
          Add a Recipe
        </h1>
      </div>

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <div className="mb-7 inline-flex overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setTab("video")}
            className={cn(
              "px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.06em]",
              tab === "video" ? "bg-ink text-white" : "bg-white text-tan"
            )}
          >
            FROM VIDEO
          </button>
          <button
            type="button"
            onClick={() => setTab("manual")}
            className={cn(
              "border-l border-border px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.06em]",
              tab === "manual" ? "bg-ink text-white" : "bg-white text-tan"
            )}
          >
            MANUAL ENTRY
          </button>
        </div>

        {tab === "video" && (
          <div className="rounded-[10px] border border-border bg-white px-8 py-7">
            <h3 className="mb-2 font-serif text-lg font-semibold text-ink">
              Paste a video link
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-body-text">
              Paste a TikTok link — the tool will extract and structure the
              recipe automatically. You&apos;ll review and confirm every
              field before it&apos;s saved; anything that couldn&apos;t be
              read is simply left blank.
            </p>
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="https://www.tiktok.com/@chef/video/..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    router.push("/recipes/add/generating");
                  }
                }}
                className="h-auto min-w-[220px] flex-1 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
              />
              <button
                type="button"
                onClick={() => router.push("/recipes/add/generating")}
                className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {tab === "manual" && (
          <div>
            <SectionHeader step="01" label="Basic info" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Recipe title
            </label>
            <Input
              placeholder="e.g. Brown Butter Pasta with Sage"
              className="mb-5 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Short description
            </label>
            <Textarea
              placeholder="A brief note about the dish — what makes it special, the occasion, or the technique."
              className="mb-5 min-h-16 rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
            <div className="mb-3 grid max-w-[220px] grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
                  Servings
                </label>
                <Input
                  defaultValue="4"
                  className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
                />
              </div>
            </div>
            <p className="mb-9 text-xs text-tan">
              Prep and cook time aren&apos;t entered here — they&apos;re
              estimated automatically once the recipe is generated, and you
              can adjust them yourself anytime after.
            </p>

            <SectionHeader step="02" label="Ingredients" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              One per line — include quantity and unit
            </label>
            <Textarea
              defaultValue={
                "250g pasta\n2 tbsp unsalted butter\n4 cloves garlic, minced\nSalt & pepper to taste"
              }
              className="mb-9 min-h-[120px] rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <SectionHeader step="03" label="Instructions" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Step-by-step — number each step
            </label>
            <Textarea
              defaultValue={
                "1. Bring a large pot of salted water to a boil.\n2. Cook pasta until al dente, about 9 minutes.\n3. Meanwhile, melt butter in a skillet over medium heat..."
              }
              className="mb-9 min-h-[120px] rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <SectionHeader step="04" label="Category" />
            <Select
            value={category}
            onValueChange={(value) => value && setCategory(value)}
          >
              <SelectTrigger className="mb-2.5 h-auto w-full rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink">
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
            {addingCategory && (
              <Input
                placeholder="New category name"
                className="mb-9 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
              />
            )}
            <button
              type="button"
              onClick={() => setAddingCategory((v) => !v)}
              className="mb-9 block font-sans text-[13px] text-tan underline"
            >
              + Add new category
            </button>

            <SectionHeader step="05" label="Tags" />
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Comma-separated — used for RAG retrieval
            </label>
            <Input
              defaultValue="pasta, vegetarian, quick, italian, weeknight"
              className="mb-8 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />

            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-border bg-white px-5.5 py-4.5">
              <div>
                <div className="mb-1.5 font-mono text-[10px] tracking-[0.06em] text-tan">
                  ESTIMATED CALORIES
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-xl font-semibold text-ink">
                    ≈ 640 kcal
                  </span>
                  <span className="inline-flex items-center rounded-full bg-tan-tint-bg px-2.5 py-1 font-mono text-[10px] tracking-[0.05em] text-tan-tint-text">
                    ESTIMATED
                  </span>
                </div>
              </div>
              <Link
                href="/ingredients"
                className="font-sans text-[13px] text-tan underline"
              >
                Manage ingredient list →
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button type="button" className="font-sans text-[13px] text-tan underline">
                Clear form
              </button>
              <button
                type="button"
                onClick={() => router.push("/recipes")}
                className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
              >
                Save Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
