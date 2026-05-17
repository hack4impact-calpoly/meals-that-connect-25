import Image from "next/image";
import { Pencil } from "lucide-react";
import { useState } from "react";
import CreateRecipePopUp from "./CreateRecipePopUp";
import { CATEGORY_DISPLAY_MAP, Recipe, TAG_STYLES } from "@/lib/types";

export type RecipeCardProps = {
  item: Recipe;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

export default function RecipeCard({ item, isSelected, onSelect, onOpen }: RecipeCardProps) {
  const [editMode, setEditMode] = useState(false);

  const tagStyle = TAG_STYLES[item.category];
  const metaText = `${item.nutritional_info.calories} cal / ${item.serving}`;

  return (
    <div
      onClick={onOpen}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-6 transition hover:shadow-md md:gap-4 md:rounded-xl md:px-5 md:py-10 ${
        isSelected ? "border-3 border-radish-900" : item.isDraft ? "border-dashed" : ""
      }`}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 md:h-20 md:w-20">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-montserrat text-lg font-bold md:text-xl" title={item.name}>
          {item.name}
        </h3>

        <p className="font-montserrat text-sm font-medium md:text-base">{metaText}</p>
      </div>

      <span
        className={`w-16 shrink-0 rounded-md px-2 py-1 text-center font-montserrat text-xs font-medium md:w-20 md:px-3 md:py-1.5 md:text-base ${tagStyle}`}
      >
        {CATEGORY_DISPLAY_MAP[item.category].label}
      </span>

      {item.isDraft && (
        <Pencil
          className="h-5 w-5 shrink-0 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setEditMode((prev) => !prev);
          }}
        />
      )}

      {editMode && (
        <CreateRecipePopUp
          onClose={() => setEditMode(false)}
          item={item}
          open={true}
          recipeType={null}
          editMode={true}
        />
      )}

      {item.isDraft && onSelect && (
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-5 w-5 shrink-0 cursor-pointer rounded-xs border-2 bg-white accent-radish-900"
        />
      )}
    </div>
  );
}
