"use client";

import EditableRowTable from "@/components/recipe/editable-row-table";
import { useIngredientsPage } from "./use-ingredients-page";
import { INGREDIENT_COLUMNS } from "./const";

export default function IngredientsPage() {
  const { rows, updateRow, removeRow, addRow } = useIngredientsPage();

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
          columns={INGREDIENT_COLUMNS}
          onChange={updateRow}
          onRemove={removeRow}
          onAdd={addRow}
          addLabel="+ Add ingredient"
        />
      </div>
    </main>
  );
}
