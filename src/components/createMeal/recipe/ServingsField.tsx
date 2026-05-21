// createMeal/shared/ServingsField.tsx

import { Minus, Plus } from "lucide-react";

type ServingsFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ServingsField({ value, onChange }: ServingsFieldProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-pepper">Servings</div>

      <div className="inline-flex items-center gap-3 rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(1, Number(value) - 1) || 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-pepper/20 bg-white text-pepper transition hover:bg-pepper/5"
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          type="number"
          value={value || "1"}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-13.5 text-center text-xl font-semibold text-pepper"
        />

        <button
          type="button"
          onClick={() => onChange(String((Number(value) || 1) + 1))}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-pepper/20 bg-white text-pepper transition hover:bg-pepper/5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="h-px bg-pepper/10" />
    </div>
  );
}
