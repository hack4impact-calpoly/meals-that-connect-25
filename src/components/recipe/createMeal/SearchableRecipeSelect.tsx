"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_MAX_RESULTS = 10;

type RecipeOption = {
  id: string;
  label: string;
};

function filterOptions(options: RecipeOption[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

type SearchableRecipeSelectProps = {
  options: RecipeOption[];
  value: string;
  onChange: (recipeId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxResults?: number;
};

/** Single-select recipe picker with search (top N results). Used in sub-recipe rows. */
export default function SearchableRecipeSelect({
  options,
  value,
  onChange,
  placeholder = "Select recipe",
  disabled = false,
  maxResults = DEFAULT_MAX_RESULTS,
}: SearchableRecipeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.id === value)?.label;

  const displayedOptions = useMemo(() => {
    return filterOptions(options, searchQuery).slice(0, maxResults);
  }, [options, searchQuery, maxResults]);

  const totalMatches = useMemo(() => filterOptions(options, searchQuery).length, [options, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    searchInputRef.current?.focus();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        className="flex h-12.5 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
      >
        <span className={`min-w-0 truncate ${selectedLabel ? "text-pepper" : "text-pepper/50"}`}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-pepper/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && !disabled ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 flex max-h-64 flex-col overflow-hidden rounded-xl border border-pepper/20 bg-white shadow-lg">
          <div className="border-b border-pepper/10 p-2">
            <div className="flex items-center gap-2 rounded-lg border border-pepper/15 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-pepper/50" strokeWidth={2} aria-hidden />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="min-w-0 flex-1 bg-transparent text-sm text-pepper outline-none placeholder:text-pepper/45"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setIsOpen(false);
                  }
                }}
              />
            </div>
            <p className="mt-1.5 px-1 text-xs text-pepper/50">
              {searchQuery.trim()
                ? totalMatches === 0
                  ? "No matches"
                  : totalMatches > maxResults
                    ? `Top ${maxResults} of ${totalMatches} matches`
                    : `${totalMatches} match${totalMatches === 1 ? "" : "es"}`
                : `Type to search · top ${maxResults} shown`}
            </p>
          </div>

          <ul className="overflow-y-auto p-1" role="listbox">
            {displayedOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-pepper/60">No recipes match your search</li>
            ) : (
              displayedOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === option.id}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm transition ${
                      value === option.id
                        ? "bg-pepper/10 font-semibold text-pepper"
                        : "text-pepper/80 hover:bg-pepper/5"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
