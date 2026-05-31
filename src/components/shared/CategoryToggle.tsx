import PillToggle from "@/components/shared/PillToggle";
import { CategoryDisplayType, CategoryValue } from "@/lib/types";

export default function CategoryToggle({
  options,
  selectedCategories,
  onToggle,
}: {
  options: CategoryDisplayType[];
  selectedCategories: Set<CategoryValue>;
  onToggle: (category: CategoryValue) => void;
}) {
  return (
    <PillToggle
      options={options.map((option) => ({
        value: option.category,
        label: option.plural,
      }))}
      selectedValues={selectedCategories}
      onToggle={onToggle}
    />
  );
}
