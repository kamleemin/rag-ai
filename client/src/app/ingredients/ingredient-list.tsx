import type { Ingredient } from "@rag-ai/shared/db";
import MonoBadge from "@/components/recipe/mono-badge";
import type { useIngredientsPage } from "./use-ingredients-page";

type IngredientItem = ReturnType<typeof useIngredientsPage>["items"][number];

/** Your saved ingredients, each with Edit and a two-step Delete. */
export default function IngredientList({
  items,
  emptyMessage,
  confirmingDeleteId,
  isDeleting,
  onEdit,
  onAskDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  items: IngredientItem[];
  /** Shown when there's nothing to list (empty list, or nothing matches the search). */
  emptyMessage: string;
  confirmingDeleteId: string | null;
  isDeleting: boolean;
  onEdit: (ingredient: Ingredient) => void;
  onAskDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-body-text">{emptyMessage}</p>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-white">
      {items.map(({ ingredient, title, nutrients, sourceLabel, sourceName }) => (
        <li key={ingredient.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">{title}</span>
              <MonoBadge>{sourceLabel}</MonoBadge>
            </div>
            {sourceName && <div className="text-xs text-body-text">{sourceName}</div>}
            <div className="text-xs text-tan-tint-text">{nutrients} per 100 g</div>
          </div>
          {confirmingDeleteId === ingredient.id ? (
            <div className="flex items-center gap-3 text-[13px]">
              <span className="text-body-text">Delete?</span>
              <button
                type="button"
                onClick={() => onConfirmDelete(ingredient.id)}
                disabled={isDeleting}
                className="font-semibold text-red-600 underline disabled:opacity-60"
              >
                {isDeleting ? "Deleting…" : "Yes"}
              </button>
              <button type="button" onClick={onCancelDelete} className="text-tan underline">
                No
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[13px]">
              <button type="button" onClick={() => onEdit(ingredient)} className="text-ink underline">
                Edit
              </button>
              <button
                type="button"
                onClick={() => onAskDelete(ingredient.id)}
                className="text-tan underline"
              >
                Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
