"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { RecipeBucket, RecipeCategory, TAG_STYLES } from "@/lib/types";

export type WeekMealCardData = {
  _id: string;
  name: string;
  calories?: number;
  servingSize?: string;
  category: RecipeCategory;
  calendarDayId: string;
  calendarBucket: RecipeBucket;
};

type WeekMealCardProps = WeekMealCardData;

export default function WeekMealCard({
  _id,
  name,
  calories,
  servingSize,
  category,
  calendarDayId,
  calendarBucket,
}: WeekMealCardProps) {
  const dndId = `calendar-${calendarDayId}-${calendarBucket}-${_id}`;
  const tagClassName = TAG_STYLES[category];

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dndId,
    data: {
      type: "recipe",
      source: "calendar",
      itemType: "recipe",
      recipeId: _id,
      dayId: calendarDayId,
      bucket: calendarBucket,
      category,
      recipeCategory: category,
      name,
      servingSize,
    },
  });

  const caloriesText = calories != null ? `${calories} cal` : null;
  const metaText = caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || servingSize;

  return (
    <div
      ref={setNodeRef}
      className={`flex cursor-move items-center gap-3 rounded-md px-4 py-3 font-montserrat shadow-[0_2px_6px_rgba(72,73,75,0.08)] ${tagClassName} ${
        isDragging ? "opacity-40" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold" title={name}>
          {name}
        </p>

        {metaText ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{metaText}</p> : null}
      </div>

      <GripVertical className="h-5 w-5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}
