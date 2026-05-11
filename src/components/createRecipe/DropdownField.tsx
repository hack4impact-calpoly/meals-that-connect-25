import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function DropdownField({
  icon: Icon,
  label,
  options,
  selectedValues,
  onSelect,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  options: { id: string; label: string }[];
  selectedValues: string[];
  onSelect: (option: { id: string; label: string }) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // close automatically when outside container is clicked on
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-pepper/20 bg-slate-50 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-pepper" strokeWidth={2.2} />
          <span className="text-sm font-semibold text-pepper">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-pepper/60">
            {selectedValues.length > 0 ? selectedValues.join(", ") : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-pepper transition-transform ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-pepper/20 bg-white shadow-lg z-10">
          <div className="p-2">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-pepper/60">{placeholder}</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-montserrat text-left transition ${
                    selectedValues.includes(option.label)
                      ? "bg-pepper/10 text-pepper font-semibold"
                      : "text-pepper/70 hover:bg-pepper/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.label)}
                    onChange={() => {}}
                    className="h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(option);
                    }}
                  />
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
