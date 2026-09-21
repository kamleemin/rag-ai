import { useState } from "react";

export function useEditableRows<T extends { id: string }>(
  initialRows: T[],
  makeEmptyRow: (id: string) => T
) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [nextId, setNextId] = useState(initialRows.length + 1);

  function updateRow(id: string, key: string, value: string) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: value } : row))
    );
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function addRow() {
    setRows((prev) => [...prev, makeEmptyRow(String(nextId))]);
    setNextId((n) => n + 1);
  }

  return { rows, updateRow, removeRow, addRow };
}
