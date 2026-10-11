import { useEditableRows } from "@/hooks/use-editable-rows";

export function useIngredientsPage() {
  // Not connected yet: start from your saved ingredients (the `ingredients` table) here.
  const { rows, updateRow, removeRow, addRow } = useEditableRows(
    [],
    (id) => ({ id, name: "", brand: "", calories: "" })
  );

  return { rows, updateRow, removeRow, addRow };
}
