import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import FilterTag from "./FilterTag";
import {
  createEmptyFilterSelections,
  FILTER_SECTIONS,
  FilterOption,
  FilterOptionId,
  FilterSection,
  FilterSectionId,
  FilterSelections,
} from "@/lib/types";

type FilterMenuProps = {
  onFilterChange?: (selections: FilterSelections) => void;
  /** Seed overlay draft from parent-applied filters when opening the sheet. */
  initialSelections?: FilterSelections;
  /** Full-screen phone layout: no live sync; Apply/Reset footer and close control. */
  mobileOverlay?: { onClose: () => void };
};

function emptySelections(): FilterSelections {
  return createEmptyFilterSelections();
}

function mergeSelections(initial?: FilterSelections): FilterSelections {
  const base = createEmptyFilterSelections();

  if (!initial) return base;

  return {
    proteinSources: new Set(initial.proteinSources),
    dietary: new Set(initial.dietary),
    exclusions: new Set(initial.exclusions),
    servings: new Set(initial.servings),
    additional: new Set(initial.additional),
  };
}

export default function FilterMenu({ onFilterChange, initialSelections, mobileOverlay }: FilterMenuProps) {
  const [selections, setSelections] = useState(() => mergeSelections(initialSelections));
  const onFilterChangeRef = useRef(onFilterChange);

  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  useEffect(() => {
    if (mobileOverlay) return;
    onFilterChangeRef.current?.(selections);
  }, [mobileOverlay, selections]);

  const handleToggleOption = (sectionId: FilterSectionId, optionId: FilterOptionId) => {
    setSelections((prev) => {
      const next: FilterSelections = { ...prev };
      const nextSet = new Set(next[sectionId] ?? []);

      if (nextSet.has(optionId)) {
        nextSet.delete(optionId);
      } else {
        nextSet.add(optionId);
      }

      next[sectionId] = nextSet;

      return next;
    });
  };

  const selectedTags = useMemo(() => {
    return FILTER_SECTIONS.flatMap((section) => {
      const sectionSelections = selections[section.id];
      return section.options
        .filter((option) => sectionSelections?.has(option.id))
        .map((option) => ({
          key: `${section.id}-${option.id}`,
          sectionId: section.id,
          optionId: option.id,
          label: option.label,
        }));
    });
  }, [selections]);

  const handleReset = () => {
    setSelections(emptySelections());
  };

  const handleApply = () => {
    onFilterChange?.(selections);
    mobileOverlay?.onClose();
  };

  const allOpen = !!mobileOverlay;

  return (
    <div
      className={
        mobileOverlay
          ? "flex h-full min-h-0 w-full flex-col bg-white pt-[max(env(safe-area-inset-top),0.75rem)] font-montserrat"
          : "w-72 border border-gray-300 bg-white px-6 py-5 font-montserrat"
      }
    >
      {mobileOverlay ? (
        <header className="grid shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-medium-gray px-2 pb-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center justify-self-start rounded-md text-pepper hover:bg-light-gray"
            aria-label="Close filters"
            onClick={mobileOverlay.onClose}
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
          <h1 className="text-center text-lg font-semibold text-pepper">Filters</h1>
          <span className="w-10 justify-self-end" aria-hidden />
        </header>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-6 w-6 text-gray-700" />
            <p className="text-xl font-semibold text-gray-900">Filters</p>
          </div>
          <hr className="mt-4 border-0 border-t border-gray-300" />
        </>
      )}

      <div className={mobileOverlay ? "flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-3" : "flex flex-col"}>
        {FILTER_SECTIONS.filter((section) => section.id !== "servings").map((section) => (
          <FilterMenuOption
            key={section.id}
            label={section.label}
            options={section.options}
            selections={selections[section.id]}
            defaultExpanded={allOpen}
            onToggle={(optionId) => handleToggleOption(section.id, optionId)}
          />
        ))}
        {selectedTags.length > 0 ? (
          <div className={`flex flex-wrap gap-2 ${mobileOverlay ? "mt-4" : "mt-4"}`}>
            {selectedTags.map((tag) => (
              <FilterTag
                key={tag.key}
                label={tag.label}
                onRemove={() => handleToggleOption(tag.sectionId, tag.optionId)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {mobileOverlay ? (
        <footer className="mt-auto flex shrink-0 gap-3 border-t border-medium-gray bg-white px-4 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4">
          <button
            type="button"
            className="flex-1 rounded-lg border-2 border-radish-900 bg-white py-3 text-center text-sm font-semibold text-radish-900 transition hover:bg-radish-100"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg bg-radish-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-radish-500"
            onClick={handleApply}
          >
            Apply
          </button>
        </footer>
      ) : null}
    </div>
  );
}

function FilterMenuOption({
  label,
  options,
  selections,
  defaultExpanded,
  onToggle,
}: {
  label: string;
  options: FilterOption[];
  selections?: Set<FilterOptionId>;
  defaultExpanded: boolean;
  onToggle: (optionId: FilterOptionId) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-gray-900"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{label}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? (
        <div className="pb-4 text-sm text-gray-700">
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gray-900"
                  checked={selections?.has(option.id) ?? false}
                  onChange={() => onToggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <hr className="border-0 border-t border-gray-300" />
    </div>
  );
}
