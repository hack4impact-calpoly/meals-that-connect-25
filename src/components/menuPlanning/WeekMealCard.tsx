"use client";

import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { TAG_STYLES } from "@/lib/types";

export type CalendarMealCategory = "entrees" | "sides" | "fruits";

export type WeekMealCardData = {
  id: string;
  name: string;
  calories?: number;
  servingSize?: string;
  tag?: "Entree" | "Entrée" | "Sides" | "Side" | "Fruit" | string;
  calendarDayId?: string;
  calendarCategory?: CalendarMealCategory;
};

type WeekMealCardProps = WeekMealCardData & {
  userRole: string | null;
};

export default function WeekMealCard({
  userRole,
  id,
  name,
  calories,
  servingSize,
  tag,
  calendarDayId,
  calendarCategory,
}: WeekMealCardProps) {
  const dragId = `calendar-${calendarDayId ?? "unknown"}-${calendarCategory ?? "unknown"}-${id}`;
  const tagClassName = tag ? (TAG_STYLES[tag] ?? TAG_STYLES.fallback) : TAG_STYLES.fallback;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    disabled: !calendarDayId || !calendarCategory,
    data: {
      type: "recipe",
      source: "calendar",
      recipeId: id,
      dayId: calendarDayId,
      category: calendarCategory,
      name,
      servingSize,
      tags: tag ? [tag] : [],
      primaryTag: tag,
    },
  });

  const caloriesText = calories != null ? `${calories} cal` : null;
  const metaText = caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || servingSize;

  return (
    <div
      ref={setNodeRef}
      className={`flex cursor-move items-center gap-3 rounded-md px-4 py-3 font-montserrat shadow-[0_2px_6px_rgba(72,73,75,0.08)] ${tagClassName} ${
        isDragging ? "opacity-40" : ""
      } ${userRole === "Admin" || userRole === "Kitchen Staff" ? "" : "pointer-events-none"}`}
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold" title={name}>
          {name}
        </p>

        {metaText ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{metaText}</p> : null}
      </div>

      <GripVertical
        className={`h-5 w-5 shrink-0 text-current opacity-90 ${userRole === "Admin" || userRole === "Kitchen Staff" ? "" : "hidden"}`}
        aria-hidden="true"
      />
    </div>
  );
}
