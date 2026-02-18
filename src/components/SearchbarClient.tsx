"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarClientProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export default function SearchBarClient({ placeholder = "Search a recipe", onSearch }: SearchBarClientProps) {
  const [value, setValue] = useState("");

  function handleChange(newValue: string) {
    setValue(newValue);
    onSearch?.(newValue);
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-radish-900" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="h-11 w-full rounded-md border border-medium-gray bg-white pl-10 pr-4 text-sm focus:border-radish-900 focus:outline-none"
      />
    </div>
  );
}
