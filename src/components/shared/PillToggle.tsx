type PillToggleOption<T extends string> = {
  value: T;
  label: string;
};

type PillToggleProps<T extends string> = {
  options: PillToggleOption<T>[];
  selectedValues: Set<T>;
  onToggle: (value: T) => void;
};

export default function PillToggle<T extends string>({ options, selectedValues, onToggle }: PillToggleProps<T>) {
  const baseClass =
    "inline-flex items-center rounded-full border border-radish-900 px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-radish-900";
  const unselectedClass = "bg-white text-radish-900 hover:bg-radish-100";
  const selectedClass = "bg-radish-900 text-white";

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = selectedValues.has(option.value);

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
