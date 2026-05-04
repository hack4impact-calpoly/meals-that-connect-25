import Image from "next/image";
import { Pencil } from "lucide-react";
import { useState } from "react";
import CreateRecipePopUp from "./CreateRecipePopUp";
import { Recipe } from "@/lib/types";

export type RecipeCardProps = {
  item: Recipe;
  imageUrl?: string;
  name: string;
  calories?: number;
  servingSize: string;
  tags?: string[];
  isDraft?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
  userRole?: string;
};
const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Side: "bg-sides-500 text-sides-900",
  Fruit: "bg-fruit-500 text-fruit-900",
  Entree: "bg-entree-900 text-entree-500",
  Entrée: "bg-entree-900 text-entree-500",
  fallback: "bg-gray-100 text-gray-700",
};

export default function RecipeCard({
  item,
  imageUrl,
  name,
  calories,
  servingSize,
  tags = [],
  isDraft = false,
  isSelected,
  onSelect,
  onOpen,
  userRole,
}: RecipeCardProps) {
  const [editMode, setEditMode] = useState(false);
  const caloriesText = calories != null ? `${calories} cal` : null;

  const servingText = servingSize != null ? `${servingSize}` : null;

  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const primaryTag = tags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;

  return (
    <div
      onClick={onOpen}
      className={`flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white py-10 px-5 transition hover:shadow-md cursor-pointer ${isSelected ? "border-3 border-radish-900" : isDraft ? "border-dashed" : ""}`}
    >
      <div className="relative shrink-0 h-20 w-20 overflow-hidden rounded-md bg-gray-100">
        {imageUrl ? <Image src={imageUrl} alt={name} fill sizes="80px" className="object-cover" /> : null}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="truncate text-xl font-bold font-montserrat" title={name}>
          {name}
        </h3>
        {metaText ? <p className="text-base font-medium font-montserrat">{metaText}</p> : null}
      </div>

      {primaryTag ? (
        <span
          className={`shrink-0 w-20 rounded-md text-center px-3 py-1.5 text-base font-medium font-montserrat ${tagStyle}`}
        >
          {primaryTag}
        </span>
      ) : null}

      {isDraft && (userRole === "Admin" || userRole === "Kitchen Staff") && (
        <Pencil className="cursor-pointer" onClick={() => setEditMode((prev) => !prev)} />
      )}

      {editMode === true && (
        <CreateRecipePopUp
          onClose={() => setEditMode(false)}
          item={item}
          open={true}
          recipeType={null}
          editMode={true}
        />
      )}

      {isDraft && onSelect && (userRole === "Admin" || userRole === "Kitchen Staff") && (
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          onClick={(e) => e.stopPropagation()} // to prevent checkbox from triggering popUp component
          className="h-5 w-5 bg-white rounded-xs border-2 accent-radish-900 cursor-pointer"
        />
      )}
    </div>
  );
}
