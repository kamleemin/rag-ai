"use client";

import { useState } from "react";
import EditableRowTable, {
  type EditableRow,
} from "@/components/recipe/editable-row-table";
import { mockIngredients } from "@/lib/mock-data";

const columns = [
  { key: "name", label: "Ingredient" },
  { key: "brand", label: "Brand" },
  { key: "calories", label: "Calories" },
];

export default function IngredientsPage() {
  const [rows, setRows] = useState<EditableRow[]>(mockIngredients);
  const [nextId, setNextId] = useState(mockIngredients.length + 1);

  function handleChange(id: string, key: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  function handleRemove(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function handleAdd() {
    setRows((prev) => [
      ...prev,
      { id: String(nextId), name: "", brand: "", calories: "" },
    ]);
    setNextId((n) => n + 1);
  }

  return (
    <main className="flex-1">
      <div className="border-b border-border bg-white px-5 py-6 sm:px-10">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Ingredients
        </h1>
      </div>

      <div className="mx-auto max-w-[720px] px-5 py-8 pb-20 sm:px-10">
        <p className="mb-7 text-sm leading-relaxed text-body-text">
          Your personal ingredient list — matched first when calculating a
          recipe&apos;s calories. Anything not listed here falls back to a
          generic estimate.
        </p>
        <EditableRowTable
          rows={rows}
          columns={columns}
          onChange={handleChange}
          onRemove={handleRemove}
          onAdd={handleAdd}
          addLabel="+ Add ingredient"
        />
      </div>
    </main>
  );
}
