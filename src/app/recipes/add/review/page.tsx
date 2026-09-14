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
import MonoBadge from "@/components/recipe/mono-badge";
import EditableRowTable, {
  type EditableRow,
} from "@/components/recipe/editable-row-table";
import { recipeCategories } from "@/lib/mock-data";

const initialRows: EditableRow[] = [
  { id: "1", name: "Pasta", amount: "250", unit: "g" },
  { id: "2", name: "Unsalted butter", amount: "2", unit: "tbsp" },
  { id: "3", name: "Garlic, minced", amount: "4", unit: "cloves" },
  { id: "4", name: "", amount: "", unit: "" },
];

const columns = [
  { key: "name", label: "Name", placeholder: "Not detected" },
  { key: "amount", label: "Amount", placeholder: "—" },
  { key: "unit", label: "Unit", placeholder: "—" },
];

export default function ReviewRecipePage() {
  const [rows, setRows] = useState<EditableRow[]>(initialRows);
  const [nextId, setNextId] = useState(5);
  const [addingCategory, setAddingCategory] = useState(false);
  const [category, setCategory] = useState(recipeCategories[0]);
  const router = useRouter();

  function handleChange(id: string, key: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  function handleRemove(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function handleAdd() {
    setRows((prev) => [...prev, { id: String(nextId), name: "", amount: "", unit: "" }]);
    setNextId((n) => n + 1);
  }

  return (
    <main className="flex-1">
      <div className="flex flex-wrap items-center gap-4 border-b border-border bg-white px-5 py-6 sm:px-10">
        <Link
          href="/recipes/add"
          className="flex items-center gap-1.5 font-sans text-[13px] text-tan"
        >
          ← Back
        </Link>
        <div className="h-8 w-px bg-border" />
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Review &amp; Edit Recipe
        </h1>
      </div>

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
          defaultValue="Brown Butter Pasta with Sage"
          className="mb-5 h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />
        <div className="mb-2 flex items-center justify-between">
          <label className="block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
            Short description
          </label>
          <MonoBadge>NOT DETECTED</MonoBadge>
        </div>
        <Textarea
          placeholder="Not detected in the video — add a note manually."
          className="mb-5 min-h-14 rounded-md border border-dashed border-border bg-muted px-3.5 py-3 text-sm text-ink"
        />
        <div className="mb-9 grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Servings
            </label>
            <Input
              defaultValue="4"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Prep (min)
            </label>
            <Input
              defaultValue="20"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[10px] tracking-[0.06em] text-tan uppercase">
              Cook (min)
            </label>
            <Input
              defaultValue="30"
              className="h-auto rounded-md border-border bg-muted px-3.5 py-3 text-sm text-ink"
            />
          </div>
        </div>

        <SectionHeader step="02" label="Ingredients" />
        <EditableRowTable
          rows={rows}
          columns={columns}
          onChange={handleChange}
          onRemove={handleRemove}
          onAdd={handleAdd}
          addLabel="+ Add ingredient"
        />
        <div className="mb-9" />

        <SectionHeader step="03" label="Instructions" />
        <Textarea
          defaultValue={
            "1. Bring a large pot of salted water to a boil.\n2. Cook pasta until al dente, about 9 minutes.\n3. Melt butter in a skillet over medium heat until browned and fragrant.\n4. Toss pasta with brown butter, garlic, and sage."
          }
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

        <SectionHeader step="05" label="Calories" />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-border bg-white px-5.5 py-4.5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-xl font-semibold text-ink">
                ≈ 640 kcal
              </span>
              <MonoBadge>ESTIMATED</MonoBadge>
            </div>
            <div className="mt-1.5 text-xs text-body-text">
              1 ingredient used a generic fallback value
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
          <Link
            href="/recipes/add"
            className="font-sans text-[13px] text-tan underline"
          >
            Discard
          </Link>
          <button
            type="button"
            onClick={() => router.push("/recipes")}
            className="rounded-md bg-green px-6 py-3 font-sans text-sm font-semibold text-white hover:bg-green-hover"
          >
            Save Recipe
          </button>
        </div>
      </div>
    </main>
  );
}
