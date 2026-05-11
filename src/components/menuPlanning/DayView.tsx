"use client";

import { useEffect, useState, useCallback } from "react";
import { GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import DroppableCalendarArea from "./DroppableCalendarArea";
import DailyNutritionSummary from "./DailyNutritionSummary";
import RecipeSeeMorePopover from "./RecipeSeeMorePopover";
import { CATEGORY_TO_BUCKET, RECIPE_BUCKETS, TAG_STYLES } from "@/lib/types";
import type { Nutrition, RecipeBuckets, RecipeNutritionOnly } from "@/lib/types";
import type { CalendarDragData } from "@/app/menuPlanning/page";
import { emptyNutrition, normalizeNutrition, sumNutrition } from "@/lib/nutrition";

interface DayViewProps {
  date: Date;
  refetchTrigger?: number;
}

type CalendarDayResponse = {
  _id: string;
  nutritional_info?: Nutrition;
} & RecipeBuckets<RecipeNutritionOnly>;

type DayMealCardProps = {
  item: RecipeNutritionOnly;
  dayId: string;
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

function DayMealCard({ item, dayId }: DayMealCardProps) {
  const bucket = CATEGORY_TO_BUCKET[item.category];
  const dndId = `calendar-${dayId}-${bucket}-${item._id}`;
  const tagClassName = TAG_STYLES[item.category];

  const dragData: CalendarDragData = {
    source: "calendar",
    item,
    dayId,
  };

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
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
      className={`group flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-4 transition hover:shadow-md ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate font-montserrat text-xl font-bold" title={item.name}>
          {item.name}
        </h3>

        {metaText ? <p className="font-montserrat text-base font-medium text-pepper/70">{metaText}</p> : null}

        <RecipeSeeMorePopover recipeId={item._id} variant="default" />
      </div>

      <span className={`shrink-0 rounded-md px-3 py-1.5 font-montserrat text-base font-medium ${tagClassName}`}>
        {item.category}
      </span>

      <button
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
  const [meals, setMeals] = useState<RecipeNutritionOnly[]>([]);
  const [nutritionTotal, setNutritionTotal] = useState<Nutrition>(emptyNutrition());
  const [isLoading, setIsLoading] = useState(true);

  const dayId = formatDayId(date);

  const fetchDayMeals = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/calendar/${dayId}`);

      if (response.status === 404) {
        setMeals([]);
        setNutritionTotal(emptyNutrition());
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar day ${dayId}`);
      }

      const calendarDay: CalendarDayResponse = await response.json();
      const nextMeals = RECIPE_BUCKETS.flatMap((bucket) => calendarDay[bucket] ?? []);

      setMeals(nextMeals);
      setNutritionTotal(
        calendarDay.nutritional_info
          ? normalizeNutrition(calendarDay.nutritional_info)
          : sumNutrition(nextMeals.map((meal) => meal.nutritional_info)),
      );
    } catch (error) {
      console.error("Error fetching day meals:", error);
      setMeals([]);
      setNutritionTotal(emptyNutrition());
    } finally {
      setIsLoading(false);
    }
  }, [dayId]);

  useEffect(() => {
    fetchDayMeals();
  }, [fetchDayMeals, refetchTrigger]);

  return (
    <div className="flex flex-col gap-3 pt-4">
      <div className="rounded-[14px] border border-medium-gray/35 bg-white p-3">
        <DroppableCalendarArea dayId={dayId}>
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 py-8 text-center font-montserrat text-xs font-medium text-pepper/55">
              Loading meals...
            </div>
          ) : meals.length > 0 ? (
            meals.map((meal) => <DayMealCard key={`${dayId}-${meal._id}`} item={meal} dayId={dayId} />)
          ) : (
            <div className="flex flex-1 items-center justify-center py-8 text-center font-montserrat text-sm font-medium text-pepper/55">
              Drop a recipe here to add it to today&apos;s menu
            </div>
          )}
        </DroppableCalendarArea>
      </div>

      <DailyNutritionSummary total={nutritionTotal} />
    </div>
  );
}
