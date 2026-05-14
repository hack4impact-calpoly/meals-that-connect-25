"use client";

import { useEffect, useState } from "react";
import WeekMealCard from "./WeekMealCard";
import NutritionInfoNotMetCard from "./NutritionInfoNotMetCard";
import DroppableCalendarArea from "./DroppableCalendarArea";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { Recipe, RecipeBuckets } from "@/lib/types";
import type { NutritionSummary } from "@/lib/nutrition";

interface WeekViewProps {
  dateToday: Date;
  weekDates: Date[];
  refetchTrigger?: number;
  nutritionByDate?: Record<string, NutritionSummary>;
}

type WeekViewDayData = {
  meals: Recipe[];
  showNutritionInfoNotMet?: boolean;
};

type CalendarDayResponse = {
  _id: string;
} & RecipeBuckets<Recipe>;

const EMPTY_DAY: WeekViewDayData = {
  meals: [],
  showNutritionInfoNotMet: false,
};

function formatCalendarDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function mapCalendarDayToMeals(calendarDay: CalendarDayResponse): Recipe[] {
  return RECIPE_BUCKETS.flatMap((bucket) => calendarDay[bucket] ?? []);
}

async function fetchCalendarDayMeals(dayId: string, signal: AbortSignal): Promise<WeekViewDayData> {
  const response = await fetch(`/api/calendar/${dayId}`, { signal });

  if (response.status === 404) {
    return {
      meals: [],
      showNutritionInfoNotMet: true,
    };
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar day ${dayId}`);
  }

  const calendarDay: CalendarDayResponse = await response.json();

  return {
    meals: mapCalendarDayToMeals(calendarDay),
    showNutritionInfoNotMet: false,
  };
}

export default function WeekView({ dateToday, weekDates, refetchTrigger, nutritionByDate = {} }: WeekViewProps) {
  const [weekViewMeals, setWeekViewMeals] = useState<WeekViewDayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const weekDayIds = weekDates.map(formatCalendarDayId);
  const weekKey = weekDayIds.join("|");

  useEffect(() => {
    const controller = new AbortController();
    const dayIds = weekKey ? weekKey.split("|") : [];

    async function fetchWeekMeals() {
      setIsLoading(true);

      try {
        const mealsByDay = await Promise.all(dayIds.map((dayId) => fetchCalendarDayMeals(dayId, controller.signal)));

        if (!controller.signal.aborted) {
          setWeekViewMeals(mealsByDay);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching week meals:", error);

        if (!controller.signal.aborted) {
          setWeekViewMeals(dayIds.map(() => ({ ...EMPTY_DAY })));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchWeekMeals();

    return () => controller.abort();
  }, [weekKey, refetchTrigger]);

  return (
    <div className="relative my-4 grid flex-1 grid-cols-5 gap-3">
      {weekDates.map((date, index) => {
        const dayId = weekDayIds[index] ?? formatCalendarDayId(date);
        const dayData = weekViewMeals[index] ?? EMPTY_DAY;
        const isToday = date.toDateString() === dateToday.toDateString();
        const nutritionSummary = nutritionByDate[dayId];
        const showNutritionWarning = nutritionSummary ? !nutritionSummary.quotaMet : dayData.showNutritionInfoNotMet;

        return (
          <div key={dayId} className="flex min-w-0 flex-col items-center">
            <span className="font-montserrat text-xs font-medium tracking-[0.12em] text-pepper">
              {date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
            </span>

            <span className={`mb-2 font-montserrat text-2xl font-bold ${isToday ? "text-radish-900" : "text-pepper"}`}>
              {String(date.getDate()).padStart(2, "0")}
            </span>

            <div
              className={`flex min-h-105 w-full flex-1 flex-col gap-3 rounded-[14px] p-3 ${
                isToday ? "border-2 border-radish-900" : "border border-medium-gray/35"
              } bg-white`}
            >
              <DroppableCalendarArea dayId={dayId}>
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 text-center font-montserrat text-xs font-medium text-pepper/55">
                    Loading meals...
                  </div>
                ) : dayData.meals.length > 0 ? (
                  dayData.meals.map((meal) => <WeekMealCard key={`${dayId}-${meal._id}`} item={meal} dayId={dayId} />)
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center font-montserrat text-xs font-medium text-pepper/55">
                    Drop recipe here
                  </div>
                )}
              </DroppableCalendarArea>

              {!isLoading && showNutritionWarning ? <NutritionInfoNotMetCard /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
