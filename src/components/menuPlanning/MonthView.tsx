"use client";

import { useEffect, useMemo, useState } from "react";
import DroppableCalendarArea from "./DroppableCalendarArea";
import MonthMealCard from "./MonthMealCard";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { CalendarDay, RecipeNutritionOnly } from "@/lib/types";
import type { NutritionSummary } from "@/lib/nutrition";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"] as const;

type Props = {
  /** In-month dates only (1..last day). */
  monthDates: Date[];
  dateToday: Date;
  nutritionByDate?: Record<string, NutritionSummary>;
  refetchTrigger?: number;
};

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatCalendarDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function mapCalendarDayToMeals(calendarDay: CalendarDay<RecipeNutritionOnly>): RecipeNutritionOnly[] {
  return RECIPE_BUCKETS.flatMap((bucket) => calendarDay[bucket] ?? []);
}

function getVisibleMonthMeals(meals: RecipeNutritionOnly[]) {
  if (meals.length <= 2) {
    return {
      visibleMeals: meals,
      hiddenCount: 0,
    };
  }

  return {
    visibleMeals: meals.slice(0, 1),
    hiddenCount: meals.length - 1,
  };
}

export default function MonthView({ monthDates, dateToday, nutritionByDate = {}, refetchTrigger }: Props) {
  const [mealsByDayId, setMealsByDayId] = useState<Record<string, RecipeNutritionOnly[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const focusDate = monthDates[0] ?? new Date();
  const year = focusDate.getFullYear();
  const month = String(focusDate.getMonth() + 1).padStart(2, "0");

  const leadingBlanks = focusDate.getDay();

  const cells: Array<Date | null> = useMemo(
    () => [...Array.from({ length: leadingBlanks }, () => null), ...monthDates],
    [leadingBlanks, monthDates],
  );

  const weeks: Array<Array<Date | null>> = [];

  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMonthMeals() {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/calendar?year=${year}&month=${month}&populate=nutrition`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch calendar month ${year}-${month}`);
        }

        const calendarDays: CalendarDay<RecipeNutritionOnly>[] = await response.json();

        const nextMealsByDayId = calendarDays.reduce<Record<string, RecipeNutritionOnly[]>>((acc, calendarDay) => {
          acc[calendarDay._id] = mapCalendarDayToMeals(calendarDay);
          return acc;
        }, {});

        if (!controller.signal.aborted) {
          setMealsByDayId(nextMealsByDayId);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching month meals:", error);

        if (!controller.signal.aborted) {
          setMealsByDayId({});
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchMonthMeals();

    return () => controller.abort();
  }, [year, month, refetchTrigger]);

  return (
    <div className="mt-4 flex w-full flex-col gap-2">
      <div className="grid shrink-0 grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center font-montserrat text-xs font-medium uppercase text-dark-gray">
            {label}
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid min-h-0 flex-1 grid-cols-7 gap-2">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`${wi}-${di}`} className="min-h-22.5" aria-hidden />;
              }

              const dayId = formatCalendarDayId(date);
              const weekend = isWeekend(date);
              const isToday = date.toDateString() === dateToday.toDateString();
              const inMonth = isSameMonth(date, focusDate);
              const meals = mealsByDayId[dayId] ?? [];
              const { visibleMeals, hiddenCount } = getVisibleMonthMeals(meals);
              const nutritionSummary = nutritionByDate[dayId];
              const showWarning = !weekend && Boolean(nutritionSummary) && !nutritionSummary?.quotaMet;

              const cellContent = (
                <div className="flex min-h-22.5 flex-col items-start gap-1 p-2 pt-5">
                  {isLoading ? (
                    <p className="font-montserrat text-sm text-pepper/45">Loading...</p>
                  ) : visibleMeals.length > 0 ? (
                    <>
                      {visibleMeals.map((meal) => (
                        <MonthMealCard key={`${dayId}-${meal._id}`} item={meal} dayId={dayId} />
                      ))}

                      {hiddenCount > 0 ? (
                        <div className="flex h-6 min-w-6 items-center justify-center rounded-md bg-jicama px-1.5 font-montserrat text-sm">
                          +{hiddenCount}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );

              return (
                <div
                  key={dayId}
                  className={`relative min-h-22.5 overflow-hidden rounded-xl border border-medium-gray ${
                    weekend ? "bg-medium-gray/35" : "bg-white"
                  } ${isToday ? "ring-2 ring-radish-900" : ""} ${inMonth ? "" : "opacity-60"}`}
                  data-drop-disabled={weekend ? "true" : undefined}
                  aria-disabled={weekend}
                  title={weekend ? "Weekends - meals cannot be placed here" : undefined}
                >
                  {showWarning ? (
                    <div className="absolute top-2 left-2 z-10">
                      <WarningQuotaMonthly />
                    </div>
                  ) : null}

                  <span className="absolute top-2 right-2 z-10 font-montserrat text-sm font-normal text-dark-gray">
                    {String(date.getDate()).padStart(2, "0")}
                  </span>

                  {weekend ? cellContent : <DroppableCalendarArea dayId={dayId}>{cellContent}</DroppableCalendarArea>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
