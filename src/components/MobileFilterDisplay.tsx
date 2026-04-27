"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState, useMemo } from "react";
import FilterTag from "./FilterTag";
import { FILTER_SECTIONS } from "./FilterMenu";
import type { FilterOption } from "./FilterMenu";
import type { FilterSelections } from "@/lib/types";

type MobileFilterDisplayProps = {
  selections: FilterSelections;
  onFilterChange: (sectionId: string, optionId: string) => void;
};

export default function MobileFilterDisplay({ selections, onFilterChange }: MobileFilterDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="md:hidden w-full font-montserrat">
      {/* Filter Pills - Always visible on mobile */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full whitespace-nowrap flex-shrink-0"
        >
          <SlidersHorizontal className="h-4 w-4 text-gray-700" />
          <span className="text-sm text-gray-900">Filters</span>
        </button>
        {selectedTags.map((tag) => (
          <FilterTag key={tag.key} label={tag.label} onRemove={() => onFilterChange(tag.sectionId, tag.optionId)} />
        ))}
      </div>

      {/* Expandable Filter Panel */}
      {isOpen && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-gray-700" />
              <p className="text-base text-gray-900 font-semibold">Filters</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <hr className="mb-3 border-0 border-t border-gray-300" />

          <div className="max-h-96 overflow-y-auto">
            {FILTER_SECTIONS.map((section) => (
              <FilterMenuOption
                key={section.id}
                label={section.label}
                options={section.options}
                selections={selections[section.id]}
                onToggle={(optionId) => onFilterChange(section.id, optionId)}
              />
            ))}
          </div>
        </div>
      )}
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
        className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-gray-900"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? (
        <div className="pb-3 text-sm text-gray-700 pl-2">
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-gray-900"
                  checked={selections?.has(option.id) ?? false}
                  onChange={() => onToggle(option.id)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <hr className="border-0 border-t border-gray-300" />
    </div>
  );
}
