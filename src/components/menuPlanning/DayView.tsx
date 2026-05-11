"use client";

import { useEffect, useState, useCallback } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import DroppableCalendarArea from "./DroppableCalendarArea";
import { CATEGORY_TO_BUCKET, RECIPE_BUCKETS, TAG_STYLES } from "@/lib/types";
import type { Recipe, RecipeBuckets, RecipeNutritionOnly } from "@/lib/types";
import type { CalendarDragData } from "@/app/menuPlanning/page";

interface DayViewProps {
  date: Date;
  refetchTrigger?: number;
}

type CalendarDayResponse = {
  _id: string;
} & RecipeBuckets<Recipe>;

type DayMealCardProps = {
  item: RecipeNutritionOnly;
  dayId: string;
  deletingId: string | null;
  onDelete: (meal: RecipeNutritionOnly) => void;
};

const formatDayId = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

export type DayMealCardPreviewProps = {
  item: RecipeNutritionOnly;
};

export function DayMealCardPreview({ item }: DayMealCardPreviewProps) {
  const tagClassName = TAG_STYLES[item.category];

  const calories = item.nutritional_info.calories;
  const servingSize = item.serving;

  const caloriesText = calories ? `${calories} cal` : null;
  const metaText =
    caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || `${servingSize} servings`;

  return (
    <div className="flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-4 shadow-lg">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-montserrat text-xl font-bold" title={item.name}>
          {item.name}
        </h3>

        {metaText ? <p className="font-montserrat text-base font-medium text-pepper/70">{metaText}</p> : null}
      </div>

      <span className={`shrink-0 rounded-md px-3 py-1.5 font-montserrat text-base font-medium ${tagClassName}`}>
        {item.category}
      </span>

      <GripVertical className="h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
    </div>
  );
}

function DayMealCard({ item, dayId, deletingId, onDelete }: DayMealCardProps) {
  const bucket = CATEGORY_TO_BUCKET[item.category];
  const dndId = `calendar-${dayId}-${bucket}-${item._id}`;
  const tagClassName = TAG_STYLES[item.category];
  const isDeleting = deletingId === item._id;

  const dragData: CalendarDragData = {
    source: "calendar",
    item,
    dayId,
  };

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: dndId,
    data: dragData,
    disabled: isDeleting,
  });

  const calories = item.nutritional_info.calories;
  const servingSize = item.serving;

  const caloriesText = calories ? `${calories} cal` : null;
  const metaText =
    caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || `${servingSize} servings`;

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-4 transition hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-montserrat text-xl font-bold" title={item.name}>
          {item.name}
        </h3>

        {metaText ? <p className="font-montserrat text-base font-medium text-pepper/70">{metaText}</p> : null}
      </div>

      <span className={`shrink-0 rounded-md px-3 py-1.5 font-montserrat text-base font-medium ${tagClassName}`}>
        {item.category}
      </span>

      <button
        type="button"
        onClick={() => onDelete(item)}
        disabled={isDeleting}
        className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={18} strokeWidth={1.7} />
      </button>

      <button
        // Only the vertical grip starts a drag, since otherwise the trashcan button would also drag
        // Makes it easier to implement linking to the recipe on click later as well.
        ref={setActivatorNodeRef}
        type="button"
        className="shrink-0 cursor-move rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100"
        aria-label={`Drag ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} strokeWidth={1.7} />
      </button>
    </div>
  );
}

export default function DayView({ date, refetchTrigger }: DayViewProps) {
  const [meals, setMeals] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dayId = formatDayId(date);

  const fetchDayMeals = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/calendar/${dayId}`);

      if (response.status === 404) {
        setMeals([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar day ${dayId}`);
      }

      const calendarDay: CalendarDayResponse = await response.json();
      const nextMeals = RECIPE_BUCKETS.flatMap((bucket) => calendarDay[bucket] ?? []);

      setMeals(nextMeals);
    } catch (error) {
      console.error("Error fetching day meals:", error);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  }, [dayId]);

  useEffect(() => {
    fetchDayMeals();
  }, [fetchDayMeals, refetchTrigger]);

  const handleDelete = async (meal: RecipeNutritionOnly) => {
    setDeletingId(meal._id);

    try {
      const response = await fetch(`/api/calendar/${dayId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: meal._id,
          category: CATEGORY_TO_BUCKET[meal.category],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe from calendar");
      }

      setMeals((prev) => prev.filter((m) => !(m._id === meal._id && m.category === meal.category)));
    } catch (error) {
      console.error("Error deleting recipe from calendar:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 pt-4">
      <div className="rounded-[14px] p-3 bg-white border border-medium-gray/35">
        <DroppableCalendarArea dayId={dayId}>
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 py-8 text-center font-montserrat text-xs font-medium text-pepper/55">
              Loading meals...
            </div>
          ) : meals.length > 0 ? (
            meals.map((meal) => (
              <DayMealCard
                key={`${dayId}-${meal._id}`}
                item={meal}
                dayId={dayId}
                deletingId={deletingId}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="flex flex-1 items-center justify-center py-8 text-center font-montserrat text-sm font-medium text-pepper/55">
              Drop a recipe here to add it to today&apos;s menu
            </div>
          )}
        </DroppableCalendarArea>
      </div>
    </div>
  );
}
