"use client";

import { useEffect, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import RecipeMonthlyCard from "@/components/RecipeMonthlyCard";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import { NutritionSummary } from "@/lib/nutrition";
import { Recipe } from "@/lib/types";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"] as const;

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

type Props = {
  /** In-month dates only (1..last day). */
  monthDates: Date[];
  dateToday: Date;
  nutritionByDate?: Record<string, NutritionSummary>;
  refetchTrigger?: number;
};

type MonthMeal = {
  recipe: Recipe;
  tag: "Entree" | "Sides" | "Fruit";
};

type CalendarDay = {
  _id: string;
  entrees?: Recipe[];
  fruits?: Recipe[];
  sides?: Recipe[];
};

function formatDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function MonthDropCell({
  dayId,
  disabled,
  className,
  children,
}: {
  dayId: string;
  disabled: boolean;
  className: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${dayId}`,
    disabled,
    data: {
      type: "calendar",
      dayId,
    },
  });

  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? "ring-2 ring-radish-900 bg-radish-100" : ""}`}>
      {children}
    </div>
  );
}

function mealsForCalendarDay(day?: CalendarDay): MonthMeal[] {
  if (!day) return [];

  return [
    ...(day.entrees ?? []).map((recipe) => ({ recipe, tag: "Entree" as const })),
    ...(day.sides ?? []).map((recipe) => ({ recipe, tag: "Sides" as const })),
    ...(day.fruits ?? []).map((recipe) => ({ recipe, tag: "Fruit" as const })),
  ];
}

export default function MonthView({ monthDates, dateToday, nutritionByDate = {}, refetchTrigger }: Props) {
  const [calendarByDate, setCalendarByDate] = useState<Record<string, CalendarDay>>({});
  const focusDate = monthDates[0] ?? new Date();
  const leadingBlanks = focusDate.getDay(); // Sunday-first
  const cells: Array<Date | null> = [...Array.from({ length: leadingBlanks }, () => null), ...monthDates];
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthKey = useMemo(() => {
    if (monthDates.length === 0) return "";
    return `${focusDate.getFullYear()}-${focusDate.getMonth() + 1}`;
  }, [focusDate, monthDates.length]);

  useEffect(() => {
    if (!monthKey) {
      setCalendarByDate({});
      return;
    }

    const controller = new AbortController();

    async function fetchMonthMeals() {
      try {
        const res = await fetch(`/api/calendar?year=${focusDate.getFullYear()}&month=${focusDate.getMonth() + 1}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch month calendar (${res.status})`);
        }

        const days: CalendarDay[] = await res.json();

        if (!controller.signal.aborted) {
          setCalendarByDate(
            days.reduce<Record<string, CalendarDay>>((acc, day) => {
              acc[day._id] = day;
              return acc;
            }, {}),
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching month meals:", error);
        if (!controller.signal.aborted) setCalendarByDate({});
      }
    }

    fetchMonthMeals();

    return () => controller.abort();
  }, [monthKey, focusDate, refetchTrigger]);

  return (
    <div className="mt-4 flex min-h-0 w-full flex-1 flex-col gap-2">
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
                return <div key={`${wi}-${di}`} className="min-h-[90px]" aria-hidden />;
              }
              const weekend = isWeekend(date);
              const isToday = date.toDateString() === dateToday.toDateString();
              const inMonth = isSameMonth(date, focusDate);
              const dayId = formatDayId(date);
              const nutritionSummary = nutritionByDate[dayId];
              const showWarning = !weekend && nutritionSummary && !nutritionSummary.quotaMet;
              const meals = mealsForCalendarDay(calendarByDate[dayId]);
              const hiddenMealCount = Math.max(0, meals.length - 3);
              const cellClassName = `relative min-h-[90px] overflow-hidden rounded-[12px] border border-medium-gray p-2 ${
                weekend ? "bg-medium-gray/35" : "bg-white"
              } ${isToday ? "ring-2 ring-radish-900" : ""} ${inMonth ? "" : "opacity-60"}`;

              return (
                <MonthDropCell key={`${wi}-${di}`} dayId={dayId} disabled={weekend} className={cellClassName}>
                  {showWarning ? (
                    <div className="absolute left-2 top-2">
                      <WarningQuotaMonthly />
                    </div>
                  ) : null}
                  <span className="absolute right-2 top-2 font-montserrat text-sm font-normal text-dark-gray">
                    {String(date.getDate()).padStart(2, "0")}
                  </span>
                  <div className="mt-7 flex flex-col gap-1">
                    {meals.slice(0, 3).map((meal) => (
                      <RecipeMonthlyCard
                        key={`${dayId}-${meal.tag}-${meal.recipe._id}`}
                        item={meal.recipe}
                        name={meal.recipe.name}
                        tags={[meal.tag]}
                      />
                    ))}
                    {hiddenMealCount > 0 ? (
                      <div className="truncate rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-dark-gray">
                        +{hiddenMealCount} more
                      </div>
                    ) : null}
                  </div>
                </MonthDropCell>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
