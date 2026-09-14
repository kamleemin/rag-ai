"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type EditableRow = { id: string; [key: string]: string };

type Column = {
  key: string;
  label: string;
  placeholder?: string;
};

const GRID =
  "grid-cols-[minmax(0,2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_28px]";

export default function EditableRowTable({
  rows,
  columns,
  onChange,
  onRemove,
  onAdd,
  addLabel,
}: {
  rows: EditableRow[];
  columns: Column[];
  onChange: (id: string, key: string, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div>
      <div className={`mb-2 grid gap-2.5 border-b border-border pb-2.5 ${GRID}`}>
        {columns.map((col) => (
          <span
            key={col.key}
            className="font-mono text-[9px] tracking-[0.06em] text-tan uppercase"
          >
            {col.label}
          </span>
        ))}
        <span />
      </div>
      {rows.map((row) => (
        <div key={row.id} className={`mb-2.5 grid items-center gap-2.5 ${GRID}`}>
          {columns.map((col) => (
            <Input
              key={col.key}
              value={row[col.key] ?? ""}
              placeholder={col.placeholder}
              onChange={(e) => onChange(row.id, col.key, e.target.value)}
              className="h-auto rounded-md border-border bg-muted px-3 py-2.5 text-sm text-ink"
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Remove row"
            onClick={() => onRemove(row.id)}
            className="size-7 rounded-md border-border text-tan"
          >
            {"×"}
          </Button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="mt-1 font-sans text-sm font-semibold text-green"
      >
        {addLabel}
      </button>
    </div>
  );
}
