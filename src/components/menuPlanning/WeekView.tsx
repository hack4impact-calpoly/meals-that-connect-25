"use client";

import { useEffect, useState } from "react";
import WeekMealCard from "./WeekMealCard";
import NutritionInfoNotMetCard from "./NutritionInfoNotMetCard";
import DroppableCalendarArea from "./DroppableCalendarArea";
import type { NutritionSummary } from "@/lib/nutrition";
import { RECIPE_BUCKETS, Recipe, RecipeBuckets } from "@/lib/types";

interface WeekViewProps {
  dateToday: Date;
  weekDates: Date[];
  refetchTrigger?: number;
  nutritionByDate?: Record<string, NutritionSummary>;
  selectedDate: Date | null;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

export default function WeekView({
  dateToday,
  weekDates,
  refetchTrigger,
  nutritionByDate = {},
  selectedDate,
}: WeekViewProps) {
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
    <div className="relative my-4 flex flex-1 flex-col gap-3 md:grid md:grid-cols-5">
      {weekDates.map((date, index) => {
        const dayId = weekDayIds[index] ?? formatCalendarDayId(date);
        const dayData = weekViewMeals[index] ?? EMPTY_DAY;
        const isToday = date.toDateString() === dateToday.toDateString();
        const nutritionSummary = nutritionByDate[dayId];
        const showNutritionWarning = nutritionSummary ? !nutritionSummary.quotaMet : dayData.showNutritionInfoNotMet;
        const isDaySelected = selectedDate ? isSameCalendarDay(date, selectedDate) : false;

        return (
          <div
            key={dayId}
            className="grid min-w-0 grid-cols-[3.25rem_minmax(0,1fr)] gap-3 md:flex md:flex-col md:items-center"
          >
            <div className="flex flex-col items-center pt-2 md:pt-0">
              <span className="font-montserrat text-xs font-medium tracking-[0.12em] text-pepper">
                {date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
              </span>

              <span
                className={`font-montserrat text-2xl font-bold md:mb-2 ${isToday ? "text-radish-900" : "text-pepper"}`}
              >
                {String(date.getDate()).padStart(2, "0")}
              </span>
            </div>

            <div
              className={`flex min-h-28 w-full min-w-0 flex-1 flex-col gap-3 rounded-[14px] p-2 sm:min-h-32 md:min-h-105 md:p-3 ${
                isToday ? "border-2 border-radish-900" : "border border-medium-gray/35"
              } bg-white ${isDaySelected && !isToday ? "ring-2 ring-radish-600/80 ring-offset-2 ring-offset-gray-100" : ""} ${
                isDaySelected && isToday ? "ring-2 ring-radish-900 ring-offset-2 ring-offset-gray-100" : ""
              }`}
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
