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
    <div
      className="
        w-full h-11 rounded-md border border-medium-gray bg-white
        flex items-center gap-2 px-3
        focus-within:border-radish-900
      "
    >
      <Search className="h-5 w-5 text-radish-900 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full text-sm bg-transparent outline-none"
      />
    </div>
  );
}
