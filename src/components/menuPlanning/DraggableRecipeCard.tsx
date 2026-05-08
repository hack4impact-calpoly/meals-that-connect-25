"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORY_TO_BUCKET, CategoryValue, Combo, Recipe, TAG_STYLES } from "@/lib/types";

type DraggableRecipeCardProps = {
  item: Recipe | Combo;
  disabled?: boolean;
};

function isRecipe(item: Recipe | Combo): item is Recipe {
  return "category" in item;
}

export default function DraggableRecipeCard({ item, disabled = false }: DraggableRecipeCardProps) {
  const itemIsRecipe = isRecipe(item);
  const itemType = itemIsRecipe ? "recipe" : "combo";
  const category: CategoryValue = itemIsRecipe ? item.category : "Combo";
  const tagStyle = TAG_STYLES[category];

  const calories = itemIsRecipe ? item.nutritional_info.calories : undefined;
  const caloriesText = calories != null ? `${calories} cal` : null;
  const servingText = item.serving != null ? `${item.serving}` : null;
  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${itemType}-${item._id}`,
    disabled,
    data: itemIsRecipe
      ? {
          type: "recipe",
          source: "sidebar",
          itemType: "recipe",
          recipeId: item._id,
          name: item.name,
          bucket: CATEGORY_TO_BUCKET[item.category],
          category: item.category,
          recipeCategory: item.category,
          item,
        }
      : {
          type: "recipe",
          source: "sidebar",
          itemType: "combo",
          comboId: item._id,
          name: item.name,
          category: "Combo",
          entrees: item.entrees,
          vegetables: item.vegetables,
          fruits: item.fruits,
          grains: item.grains,
          item,
        },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-3 rounded-xl border-2 border-gray-300 bg-white p-4 transition ${
        isDragging ? "opacity-50 bg-gray-50" : "hover:shadow-md"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-montserrat text-md font-bold" title={item.name}>
          {item.name}
        </h3>
        {metaText ? <p className="font-montserrat text-base font-medium">{metaText}</p> : null}
      </div>

      <span className={`shrink-0 rounded-md px-2 py-1.5 font-montserrat text-xs font-medium ${tagStyle}`}>
        {category}
      </span>

      <GripVertical size={20} strokeWidth={1.7} className="shrink-0 cursor-move text-gray-500" />
    </div>
  );
}
