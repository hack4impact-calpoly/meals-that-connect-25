import { ChevronDown, Search, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_MAX_SEARCH_RESULTS = 10;

function filterOptionsByQuery(options: { id: string; label: string }[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

export function DropdownField({
  icon: Icon,
  label,
  options,
  selectedValues,
  onSelect,
  placeholder,
  searchable = false,
  maxSearchResults = DEFAULT_MAX_SEARCH_RESULTS,
}: {
  icon: LucideIcon;
  label: string;
  options: { id: string; label: string }[];
  selectedValues: string[];
  onSelect: (option: { id: string; label: string }) => void;
  placeholder: string;
  /** When true, shows a search input and limits the list to the top matches (default 10). */
  searchable?: boolean;
  maxSearchResults?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayedOptions = useMemo(() => {
    const filtered = searchable ? filterOptionsByQuery(options, searchQuery) : options;
    if (!searchable) {
      return filtered;
    }

    return filtered.slice(0, maxSearchResults);
  }, [options, searchQuery, searchable, maxSearchResults]);

  const totalMatches = useMemo(() => {
    if (!searchable) {
      return options.length;
    }

    return filterOptionsByQuery(options, searchQuery).length;
  }, [options, searchQuery, searchable]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    if (searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  const closeDropdown = () => setIsOpen(false);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-pepper/20 bg-slate-50 px-4 py-3"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Icon className="h-5 w-5 shrink-0 text-pepper" strokeWidth={2.2} />
          <span className="text-sm font-semibold text-pepper">{label}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm text-pepper/60">
            {selectedValues.length > 0 ? selectedValues.join(", ") : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-pepper transition-transform ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 flex w-full max-h-72 flex-col overflow-hidden rounded-xl border border-pepper/20 bg-white shadow-lg">
          {searchable ? (
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
                      closeDropdown();
                    }
                  }}
                />
              </div>
              {searchQuery.trim() ? (
                <p className="mt-1.5 px-1 text-xs text-pepper/50">
                  {totalMatches === 0
                    ? "No matches"
                    : totalMatches > maxSearchResults
                      ? `Showing top ${maxSearchResults} of ${totalMatches} matches`
                      : `${totalMatches} match${totalMatches === 1 ? "" : "es"}`}
                </p>
              ) : (
                <p className="mt-1.5 px-1 text-xs text-pepper/50">Type to search · showing top {maxSearchResults}</p>
              )}
            </div>
          ) : null}

          <div className="overflow-y-auto p-2">
            {displayedOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-pepper/60">
                {searchable && searchQuery.trim() ? "No recipes match your search" : placeholder}
              </div>
            ) : (
              displayedOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-montserrat text-sm transition ${
                    selectedValues.includes(option.label)
                      ? "bg-pepper/10 font-semibold text-pepper"
                      : "text-pepper/70 hover:bg-pepper/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.label)}
                    onChange={() => {}}
                    className="h-4 w-4 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(option);
                    }}
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
