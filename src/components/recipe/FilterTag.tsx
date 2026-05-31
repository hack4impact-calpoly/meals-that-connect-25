import { X } from "lucide-react";

type FilterTagProps = {
  label: string;
  onRemove?: () => void;
};

export default function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full bg-gray-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-gray-700"
      aria-label={`Remove ${label} filter`}
    >
      <X className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}
