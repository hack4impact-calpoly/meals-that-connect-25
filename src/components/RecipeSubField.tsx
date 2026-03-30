"use client";

import React, { useId, useMemo, useState } from "react";
import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";

type RecipeSubFieldVariant = "sides" | "fruit" | "filters" | "allergens";

type RecipeSubFieldProps = {
  label: string;
  icon: LucideIcon;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  variant?: RecipeSubFieldVariant;
};

const VARIANT_STYLES: Record<RecipeSubFieldVariant, { tag: string; option: string }> = {
  sides: {
    tag: "bg-lime text-pepper",
    option: "hover:bg-lime/70",
  },
  fruit: {
    tag: "bg-fruit-900 text-white",
    option: "hover:bg-fruit-500",
  },
  filters: {
    tag: "bg-pepper text-white",
    option: "hover:bg-pepper/8",
  },
  allergens: {
    tag: "bg-pepper text-white",
    option: "hover:bg-pepper/8",
  },
};

export default function RecipeSubField({
  label,
  icon: Icon,
  options,
  selectedValues,
  onChange,
  placeholder = "Search and select options",
  variant = "filters",
}: RecipeSubFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputId = useId();
  const styles = VARIANT_STYLES[variant];

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return options.filter((option) => {
      if (selectedValues.includes(option)) return false;
      if (!normalizedQuery) return true;
      return option.toLowerCase().includes(normalizedQuery);
    });
  }, [options, query, selectedValues]);

  const addValue = (value: string) => {
    if (selectedValues.includes(value)) return;
    onChange([...selectedValues, value]);
    setQuery("");
    setIsOpen(true);
  };

  const removeValue = (value: string) => {
    onChange(selectedValues.filter((selected) => selected !== value));
  };

  return (
    <div
      className="relative flex items-start gap-4"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <label
        htmlFor={inputId}
        className="flex w-24 shrink-0 items-center gap-2 pt-2 text-[15px] font-montserrat font-semibold text-pepper"
      >
        <Icon className={`h-5 w-5 shrink-0 text-pepper`} strokeWidth={2.25} />
        <span>{label}</span>
      </label>

      <div className="min-w-0 flex-1">
        <div
          className={`min-h-[42px] rounded-sm border-2 px-2 py-1.5 transition focus-within:border-pepper bg-white border-medium-gray/80`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedValues.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => removeValue(value)}
                className={`inline-flex items-center gap-1 rounded-[4px] px-2 py-2 text-[13px] leading-none font-montserrat font-semibold transition-opacity hover:opacity-90 ${styles.tag}`}
                aria-label={`Remove ${value}`}
              >
                <span>{value}</span>
                {/* <X className="h-3 w-3 opacity-70" /> */}
              </button>
            ))}

            <div className="flex min-w-[120px] flex-1 items-center gap-2">
              <input
                id={inputId}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !query && selectedValues.length > 0) {
                    removeValue(selectedValues[selectedValues.length - 1]);
                  }

                  if ((event.key === "Enter" || event.key === "Tab") && filteredOptions.length > 0) {
                    event.preventDefault();
                    addValue(filteredOptions[0]);
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();
                    setIsOpen(false);
                  }
                }}
                placeholder={selectedValues.length === 0 ? placeholder : ""}
                className={`min-w-0 flex-1 border-0 bg-transparent py-1 text-[13px] font-montserrat text-pepper outline-none placeholder:text-pepper/45`}
              />
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setIsOpen((prev) => !prev)}
                className="ml-auto shrink-0 text-pepper/45 transition hover:text-pepper"
                aria-label={`${isOpen ? "Hide" : "Show"} ${label} options`}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute top-full right-0 z-20 mt-1 max-h-56 w-[calc(100%-7rem)] overflow-y-auto rounded-sm border border-medium-gray bg-white py-1 shadow-md">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addValue(option)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left font-montserrat text-[13px] text-pepper transition ${styles.option}`}
              >
                <span>{option}</span>
                <Check className="h-4 w-4 text-pepper/35" />
              </button>
            ))
          ) : (
            <div className="px-3 py-2 font-montserrat text-[13px] text-pepper/55">No matching options</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
