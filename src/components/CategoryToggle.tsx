import { CategoryValue } from "@/lib/types";

export default function CategoryToggle({
  options,
  selectedCategories,
  onToggle,
}: {
  options: Array<{ value: CategoryValue; label: string }>;
  selectedCategories: Set<CategoryValue>;
  onToggle: (category: CategoryValue) => void;
}) {
  const baseClass =
    "inline-flex items-center rounded-full border border-radish-900 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-radish-900";
  const unselectedClass = "bg-white text-radish-900 hover:bg-radish-100";
  const selectedClass = "bg-radish-900 text-white";

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = selectedCategories.has(option.value);

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`${baseClass} ${selected ? selectedClass : unselectedClass}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
