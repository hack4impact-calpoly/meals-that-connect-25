"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORY_TO_BUCKET, TAG_STYLES } from "@/lib/types";
import type { RecipeNutritionOnly } from "@/lib/types";
import type { CalendarDragData } from "@/app/menuPlanning/page";
import RecipeSeeMorePopover from "./RecipeSeeMorePopover";

type MonthMealCardProps = {
  item: RecipeNutritionOnly;
  dayId: string;
  variant?: "card" | "bar";
};

type MonthMealCardPreviewProps = {
  item: RecipeNutritionOnly;
};

const MONTH_BAR_STYLES = {
  Entree: "bg-entree-bg",
  Vegetable: "bg-vegetable-bg",
  Fruit: "bg-fruit-bg",
  Grain: "bg-grain-bg",
} as const;

export function MonthMealCardPreview({ item }: MonthMealCardPreviewProps) {
  const tagClassName = TAG_STYLES[item.category];

  return (
    <div
      className={`flex w-40 max-w-40 items-center gap-1.5 rounded-md px-2 py-1 font-montserrat text-sm shadow-lg ${tagClassName}`}
    >
      <p className="min-w-0 flex-1 truncate leading-tight" title={item.name}>
        {item.name}
      </p>

      <GripVertical className="h-3.5 w-3.5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}

export default function MonthMealCard({ item, dayId, variant = "card" }: MonthMealCardProps) {
  const bucket = CATEGORY_TO_BUCKET[item.category];
  const dndId = `calendar-${variant}-${dayId}-${bucket}-${item._id}`;
  const barClassName = MONTH_BAR_STYLES[item.category];
  const tagClassName = TAG_STYLES[item.category];

  const dragData: CalendarDragData = {
    source: "calendar",
    item,
    dayId,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dndId,
    data: dragData,
  });

  if (variant === "bar") {
    return (
      <div
        ref={setNodeRef}
        className={`h-2 w-full cursor-move rounded-full shadow-[0_1px_2px_rgba(72,73,75,0.12)] ${barClassName} ${
          isDragging ? "opacity-40" : ""
        }`}
        title={`${item.name} (${item.category})`}
        aria-label={`${item.name} (${item.category})`}
        {...attributes}
        {...listeners}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`group flex max-w-full cursor-move flex-col gap-0.5 rounded-md px-2 py-1.5 font-montserrat text-sm shadow-[0_2px_6px_rgba(72,73,75,0.08)] ${tagClassName} ${
        isDragging ? "opacity-40" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex min-w-0 items-center gap-1">
        <p className="min-w-0 flex-1 truncate leading-tight" title={item.name}>
          {item.name}
        </p>

        <GripVertical className="h-3.5 w-3.5 shrink-0 text-current opacity-90" aria-hidden="true" />
      </div>

      <RecipeSeeMorePopover recipeId={item._id} variant="compact" />
    </div>
  );
}
