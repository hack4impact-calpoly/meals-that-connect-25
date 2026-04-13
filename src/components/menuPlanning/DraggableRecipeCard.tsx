"use client";
import Image from "next/image";
import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableRecipeCardProps {
  recipeId: string;
  imageUrl?: string;
  name: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
  itemType?: "recipe" | "combo";
  sides?: string[];
  fruits?: string[];
  disabled?: boolean;
}

const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Sides: "bg-sides-500 text-sides-900",
  Fruit: "bg-fruit-500 text-fruit-900",
  Entree: "bg-entree-900 text-entree-500",
  Entrée: "bg-entree-900 text-entree-500",
  fallback: "bg-gray-100 text-gray-700",
};

export default function DraggableRecipeCard({
  recipeId,
  imageUrl,
  name,
  calories,
  servingSize,
  tags = [],
  itemType,
  sides = [],
  fruits = [],
  disabled = false,
}: DraggableRecipeCardProps) {
  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => tag?.toString().trim()).filter(Boolean)
    : tags
      ? [tags.toString().trim()]
      : ["Entree"];

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipeId}`,
    data: {
      type: "recipe",
      recipeId,
      name,
      tags: normalizedTags,
      primaryTag: normalizedTags[0] || "Entree",
      itemType,
      sides,
      fruits,
    },
    disabled,
  });

  // Debug logging
  if (!recipeId) {
    console.warn("Warning: DraggableRecipeCard received empty recipeId for recipe:", name);
  }

  const caloriesText = calories != null ? `${calories} cal` : null;

  const servingText = servingSize != null ? `${servingSize}` : null;

  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const primaryTag = tags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 rounded-xl border-2 border-gray-300 bg-white p-4 transition ${
        isDragging ? "opacity-50 bg-gray-50" : "hover:shadow-md"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="relative shrink-0 h-12 w-12 overflow-hidden rounded-md bg-gray-100">
        {imageUrl ? <Image src={imageUrl} alt={name} fill sizes="80px" className="object-cover" /> : null}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="truncate text-md font-bold font-montserrat" title={name}>
          {name}
        </h3>
        {metaText ? <p className="text-base font-medium font-montserrat">{metaText}</p> : null}
      </div>

      {primaryTag ? (
        <span className={`shrink-0 rounded-md px-2 py-1.5 text-xs font-medium font-montserrat ${tagStyle}`}>
          {primaryTag}
        </span>
      ) : null}

      <GripVertical size={20} strokeWidth={1.7} className="cursor-move text-gray-500 flex-shrink-0" />
    </div>
  );
}
