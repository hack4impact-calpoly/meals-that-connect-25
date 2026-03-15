"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import FilterTag from "./FilterTag";

type FilterOption = {
  id: string;
  label: string;
};

type FilterSection = {
  id: string;
  label: string;
  options: FilterOption[];
};

type FilterSelections = Record<string, Set<string>>;

type FilterMenuProps = {
  onFilterChange?: (selections: FilterSelections) => void;
};

export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: "allergens",
    label: "Allergens / Exclusions",
    options: [
      { id: "dairy-free", label: "Dairy-Free" },
      { id: "gluten-free", label: "Gluten-Free" },
      { id: "nut-free", label: "Nut-Free" },
      { id: "soy-free", label: "Soy-Free" },
      { id: "shellfish-free", label: "Shellfish-Free" },
    ],
  },
  {
    id: "proteins",
    label: "Proteins",
    options: [
      { id: "chicken", label: "Chicken" },
      { id: "beef", label: "Beef" },
      { id: "fish", label: "Fish" },
      { id: "tofu", label: "Tofu" },
      { id: "beans", label: "Beans" },
    ],
  },
  {
    id: "vitamins",
    label: "Vitamins / Minerals",
    options: [
      { id: "iron", label: "Iron" },
      { id: "vitamin-a", label: "Vitamin A" },
      { id: "vitamin-c", label: "Vitamin C" },
      { id: "calcium", label: "Calcium" },
      { id: "potassium", label: "Potassium" },
    ],
  },
  {
    id: "dietary",
    label: "Dietary Preferences",
    options: [
      { id: "vegetarian", label: "Vegetarian" },
      { id: "vegan", label: "Vegan" },
      { id: "halal", label: "Halal" },
      { id: "kosher", label: "Kosher" },
      { id: "low-sodium", label: "Low Sodium" },
    ],
  },
  {
    id: "serving",
    label: "Serving Sizes",
    options: [
      { id: "single-serving", label: "1 Serving" },
      { id: "small-serving", label: "2-3 Servings" },
      { id: "family-serving", label: "4-6 Servings" },
      { id: "party-serving", label: "7+ Servings" },
    ],
  },
];

export default function FilterMenu({ onFilterChange }: FilterMenuProps) {
  const initialSelections = useMemo<FilterSelections>(() => {
    return FILTER_SECTIONS.reduce<FilterSelections>((acc, section) => {
      acc[section.id] = new Set();
      return acc;
    }, {});
  }, []);

  const [selections, setSelections] = useState<FilterSelections>(initialSelections);

  useEffect(() => {
    onFilterChange?.(selections);
  }, [onFilterChange, selections]);

  const handleToggleOption = (sectionId: string, optionId: string) => {
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

  return (
    <div className="w-72 border border-gray-300 bg-white px-6 py-5 font-montserrat">
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-6 w-6 text-gray-700" />
        <p className="text-xl text-gray-900 font-semibold">Filters</p>
      </div>
      <hr className="mt-4 border-0 border-t border-gray-300" />
      {FILTER_SECTIONS.map((section) => (
        <FilterMenuOption
          key={section.id}
          label={section.label}
          options={section.options}
          selections={selections[section.id]}
          onToggle={(optionId) => handleToggleOption(section.id, optionId)}
        />
      ))}
      {selectedTags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
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
  );
}

function FilterMenuOption({
  label,
  options,
  selections,
  onToggle,
}: {
  label: string;
  options: FilterOption[];
  selections?: Set<string>;
  onToggle: (optionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-gray-900 text-sm"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{label}</span>
        <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
