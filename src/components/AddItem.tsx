"use client";

import { PlusCircle } from "lucide-react";

interface AddItemButtonProps {
  onClick?: () => void;
  label?: string;
}

export default function AddItemButton({ onClick, label = "Add Item" }: AddItemButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-cucumber bg-white px-4 py-2 text-cucumber hover:bg-cucumber/10"
    >
      {label}
      <PlusCircle className="h-5 w-5 text-cucumber" />
    </button>
  );
}
