import React from "react";

export function NutritionalInfo({
  label,
  unit,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="w-23 rounded-lg border border-pepper/20 bg-white px-2 py-2">
      {/* top row: value + unit */}
      <div className="flex items-center justify-center gap-1">
        <input
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="--"
          readOnly={readOnly}
          className="w-8 bg-transparent text-center text-sm font-montserrat font-semibold text-pepper outline-none"
        />
        <span className="text-sm font-montserrat font-semibold text-pepper/70">{unit}</span>
      </div>

      {/* bottom row: label */}
      <div className="mt-1 text-center text-xs font-montserrat font-semibold text-pepper/80">{label}</div>
    </div>
  );
}
