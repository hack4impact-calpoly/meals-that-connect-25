import { CategoryValue, RoleValue } from "@/lib/types";

type Option<T> = { value: T; label: string };

interface CategoryToggleProps<T> {
  options: Array<Option<T>>;
  selectedCategories: Set<T>;
  onToggle: (category: T) => void;
}

export default function CategoryToggle<T extends string>({
  options,
  selectedCategories,
  onToggle,
}: CategoryToggleProps<T>) {
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
