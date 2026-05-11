"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CATEGORY_TO_BUCKET, TAG_STYLES } from "@/lib/types";
import type { RecipeNutritionOnly } from "@/lib/types";
import type { CalendarDragData } from "@/app/menuPlanning/page";

type MonthMealCardProps = {
  item: RecipeNutritionOnly;
  dayId: string;
};

type MonthMealCardPreviewProps = {
  item: RecipeNutritionOnly;
};

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

export default function MonthMealCard({ item, dayId }: MonthMealCardProps) {
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

  return (
    <div
      ref={setNodeRef}
      className={`flex max-w-full cursor-move items-center gap-1.5 rounded-md px-2 py-1 font-montserrat text-sm shadow-[0_2px_6px_rgba(72,73,75,0.08)] ${tagClassName} ${
        isDragging ? "opacity-40" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <p className="min-w-0 flex-1 truncate leading-tight" title={item.name}>
        {item.name}
      </p>

      <GripVertical className="h-3.5 w-3.5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}
