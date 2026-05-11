"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORY_TO_BUCKET, TAG_STYLES, type Recipe, type RecipeBucket, type RecipeCategory } from "@/lib/types";
import { ActiveDragData, CalendarDragData } from "@/app/menuPlanning/page";

export type WeekMealCardProps = {
  item: Recipe;
  dayId: string;
};

export default function WeekMealCard({ item, dayId }: WeekMealCardProps) {
  const bucket = CATEGORY_TO_BUCKET[item.category];
  const dndId = `calendar-${dayId}-${bucket}-${item._id}`;
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

  const calories = item.nutritional_info.calories;
  const servingSize = item.serving;

  const caloriesText = calories ? `${calories} cal` : null;
  const metaText =
    caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || `${servingSize} servings`;

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
        <p className="truncate text-[16px] leading-tight font-bold" title={item.name}>
          {item.name}
        </p>

        {metaText ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{metaText}</p> : null}
      </div>

      <GripVertical className="h-5 w-5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}
