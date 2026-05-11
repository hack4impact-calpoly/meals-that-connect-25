import type { LucideIcon } from "lucide-react";

export function FieldRow({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-pepper/20 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3 text-sm font-semibold text-pepper">
        <Icon className="h-5 w-5 text-pepper" strokeWidth={2.2} />
        <span>{label}</span>
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-pepper/20 bg-white px-3 py-2 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
      />
    </label>
  );
}
