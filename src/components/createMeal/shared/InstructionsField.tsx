import { ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function InstructionsField({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-pepper">Instructions</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="List instructions here"
        rows={3}
        className="min-h-24 w-full rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
      />
    </div>
  );
}
