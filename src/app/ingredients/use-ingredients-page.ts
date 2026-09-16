import { useEditableRows } from "@/hooks/use-editable-rows";
import { mockIngredients } from "@/lib/mock-data";

export function useIngredientsPage() {
  const { rows, updateRow, removeRow, addRow } = useEditableRows(
    mockIngredients,
    (id) => ({ id, name: "", brand: "", calories: "" })
  );

  return { rows, updateRow, removeRow, addRow };
}
