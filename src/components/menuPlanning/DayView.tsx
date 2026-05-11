"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import DroppableCalendarArea from "./DroppableCalendarArea";
import DailyNutritionSummary from "./DailyNutritionSummary";
import { BUCKET_TO_CATEGORY, Nutrition, RECIPE_BUCKETS, TAG_STYLES } from "@/lib/types";
import type { Recipe, RecipeBucket, RecipeBuckets, RecipeCategory } from "@/lib/types";

interface DayViewProps {
  date: Date;
  refetchTrigger?: number;
}

type DayMeal = {
  id: string;
  name: string;
  servingSize?: string;
  tag: RecipeCategory;
  category: RecipeBucket;
};

type CalendarDayResponse = {
  _id: string;
} & RecipeBuckets<Recipe>;

const formatDayId = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
};

export default function DayView({ date, refetchTrigger }: DayViewProps) {
  const [meals, setMeals] = useState<DayMeal[]>([]);
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

      const nextMeals = RECIPE_BUCKETS.flatMap((bucket) => {
        const recipes = calendarDay[bucket] ?? [];
        const tag = BUCKET_TO_CATEGORY[bucket];

        return recipes.map((recipe) => ({
          id: recipe._id,
          name: recipe.name,
          servingSize: recipe.serving != null ? `${recipe.serving} servings` : undefined,
          tag,
          category: bucket,
        }));
      });

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

  const handleDelete = async (meal: DayMeal) => {
    setDeletingId(meal.id);

    try {
      const response = await fetch(`/api/calendar/${dayId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: meal.id,
          category: meal.category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe from calendar");
      }

      setMeals((prev) => prev.filter((m) => !(m.id === meal.id && m.category === meal.category)));
    } catch (error) {
      console.error("Error deleting recipe from calendar:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const emptyNutrition: Nutrition[] = [];

  return (
    <div className="mt-4 flex flex-col gap-3">
      <DroppableCalendarArea dayId={dayId}>
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 py-8 text-center font-montserrat text-xs font-medium text-pepper/55">
            Loading meals...
          </div>
        ) : meals.length > 0 ? (
          meals.map((meal) => {
            const tagStyle = TAG_STYLES[meal.tag];

            return (
              <div
                key={`${meal.id}-${meal.category}`}
                className="flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-4 transition hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-montserrat text-xl font-bold" title={meal.name}>
                    {meal.name}
                  </h3>

                  {meal.servingSize ? (
                    <p className="font-montserrat text-base font-medium text-pepper/70">{meal.servingSize}</p>
                  ) : null}
                </div>

                <span className={`shrink-0 rounded-md px-3 py-1.5 font-montserrat text-base font-medium ${tagStyle}`}>
                  {meal.tag}
                </span>

                <button
                  onClick={() => handleDelete(meal)}
                  disabled={deletingId === meal.id}
                  className="shrink-0 rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  aria-label={`Remove ${meal.name}`}
                >
                  <Trash2 size={18} strokeWidth={1.7} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="flex flex-1 items-center justify-center py-8 text-center font-montserrat text-sm font-medium text-pepper/55">
            Drop a recipe here to add it to today&apos;s menu
          </div>
        )}
      </DroppableCalendarArea>

      <DailyNutritionSummary recipes={emptyNutrition} />
    </div>
  );
}
