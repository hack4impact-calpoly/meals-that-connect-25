"use client";
import Image from "next/image";
import { GripVertical } from "lucide-react";

interface DraggableRecipeCardProps {
  imageUrl?: string;
  name: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
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
  imageUrl,
  name,
  calories,
  servingSize,
  tags = [],
}: DraggableRecipeCardProps) {
  const caloriesText = calories != null ? `${calories} cal` : null;

  const servingText = servingSize != null ? `${servingSize}` : null;

  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const primaryTag = tags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;

  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-gray-300 bg-white p-4 transition hover:shadow-md">
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

      <GripVertical size={20} strokeWidth={1.7} className="cursor-move text-gray-500" />
    </div>
  );
}
