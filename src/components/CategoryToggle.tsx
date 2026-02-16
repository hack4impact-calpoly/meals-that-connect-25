"use client";

export type CategoryOption = {
  value: string;
  label: string;
};

type Props = {
  options: CategoryOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function CategoryToggle({ options, value = "all", onChange, className }: Props) {
  const interactive = typeof onChange === "function";

  const pillBase = "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const pillInactive = "border border-radish-900 text-radish-900 bg-white";
  const pillActive = "bg-radish-900 text-white border border-radish-900";

  return (
    <div className={["flex flex-wrap gap-2", className ?? ""].join(" ")}>
      {options.map((opt) => {
        const selected = opt.value === value;

        if (!interactive) {
          return (
            <span key={opt.value} className={[pillBase, selected ? pillActive : pillInactive].join(" ")}>
              {opt.label}
            </span>
          );
        }

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              pillBase,
              "transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-radish-900",
              selected ? pillActive : pillInactive,
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
