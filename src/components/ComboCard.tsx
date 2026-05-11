"use client";

import Image from "next/image";
import { Pencil, Utensils } from "lucide-react";
import { COMBO_CATEGORY_DISPLAY, Combo, Recipe, RecipePreview, TAG_STYLES } from "@/lib/types";
import { useState } from "react";
import CreateRecipePopUp from "./CreateRecipePopUp";

type ComboCardProps = {
  item: Combo<RecipePreview>;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

async function getCombo(id: string): Promise<Combo<Recipe>> {
  const res = await fetch(`/api/combos/${id}?populate=all`);

  if (!res.ok) {
    throw new Error(`Failed to get combo (${res.status})`);
  }

  return res.json();
}

export default function ComboCard({ item, isSelected, onSelect, onOpen }: ComboCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState<Combo<Recipe> | null>(null);
  const [isLoadingEditItem, setIsLoadingEditItem] = useState(false);

  const recipes = [...(item.entrees ?? []), ...(item.vegetables ?? []), ...(item.fruits ?? []), ...(item.grains ?? [])];

  const servingText = item.serving != null ? `${item.serving}` : null;

  const handleEditClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (editItem) {
      setEditMode(true);
      return;
    }

    setIsLoadingEditItem(true);

    try {
      const fullCombo = await getCombo(item._id);
      setEditItem(fullCombo);
      setEditMode(true);
    } catch (error) {
      console.error("Failed to load combo for editing:", error);
    } finally {
      setIsLoadingEditItem(false);
    }
  };

  return (
    <div
      onClick={onOpen}
      className={`relative h-86.5 cursor-pointer overflow-hidden rounded-[14px] ${
        isSelected
          ? "border-3 border-radish-900"
          : item.isDraft
            ? "border-3 border-dashed border-gray-300"
            : "border-2 border-gray-300"
      } bg-white`}
    >
      <div className="relative h-28 w-full bg-medium-gray">
        {item.imageUrl ? (
          <Image src={item.imageUrl} className="h-full w-full object-cover" fill sizes="288px" alt="" />
        ) : null}

        {editMode && editItem ? (
          <CreateRecipePopUp
            onClose={() => setEditMode(false)}
            item={editItem}
            open={true}
            recipeType={COMBO_CATEGORY_DISPLAY}
            editMode={true}
          />
        ) : null}

        {item.isDraft && (
          <Pencil
            className={`absolute top-35 right-4 z-20 h-5 w-5 cursor-pointer rounded-xs accent-radish-900 ${
              isLoadingEditItem ? "opacity-50" : ""
            }`}
            onClick={handleEditClick}
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
            className="absolute top-4 right-4 z-20 h-5 w-5 cursor-pointer rounded-xs border-2 bg-white accent-radish-900"
          />
        )}

        <span
          className={`absolute left-2 top-24 inline-flex rounded-full border-[3px] border-white px-4 py-1.5 font-montserrat text-base ${
            item.isDraft ? "bg-light-gray text-combo-text italic" : TAG_STYLES.Combo
          }`}
        >
          {item.isDraft ? "Draft" : "Combo"}
        </span>
      </div>

      <div className="flex h-[calc(100%-7rem)] min-h-0 flex-col p-4">
        <div className="space-y-3">
          <p className="mt-3 font-montserrat text-base font-bold">{item.name}</p>

          <div className="flex max-h-30 flex-col gap-1.5 overflow-y-auto">
            {recipes.map((recipe) => (
              <span
                key={`${recipe.category}-${recipe._id}`}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 font-montserrat text-xs font-medium ${
                  TAG_STYLES[recipe.category]
                }`}
              >
                {recipe.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto ml-auto flex items-center gap-1">
          <Utensils className="h-2.5 w-2.5 text-combo-text" />
          <p className="font-montserrat text-xs">Serves {servingText}</p>
        </div>
      </div>
    </div>
  );
}
