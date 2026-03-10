"use client";

import { Search } from "lucide-react";
import * as React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search" }: SearchBarProps) {
  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-radish-900" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-medium-gray bg-white pl-10 pr-4 text-sm focus:border-radish-900 focus:outline-none"
      />
    </form>
  );
}
