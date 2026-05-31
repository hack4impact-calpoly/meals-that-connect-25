"use client";

import { useEffect, useMemo, useState } from "react";
import DroppableCalendarArea from "./DroppableCalendarArea";
import MonthMealCard from "./MonthMealCard";
import WarningQuotaMonthly from "@/components/menuPlanning/WarningQuotaMonthly";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { NutritionSummary } from "@/lib/nutrition";
import type { CalendarDay, RecipeNutritionOnly } from "@/lib/types";

const MOBILE_WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI"] as const;
const DESKTOP_WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"] as const;

type Props = {
  /** In-month dates only (1..last day). */
  monthDates: Date[];
  dateToday: Date;
  nutritionByDate?: Record<string, NutritionSummary>;
  refetchTrigger?: number;
  /** Calendar day picked in month view; used when switching to week/day on the parent. */
  selectedDate: Date | null;
  onDaySelect: (date: Date) => void;
  userRole: string | null;
};

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

function getVisibleMobileMonthMeals(meals: RecipeNutritionOnly[]) {
  if (meals.length <= 3) {
    return {
      visibleMeals: meals,
      hiddenCount: 0,
    };
  }

  return {
    visibleMeals: meals.slice(0, 3),
    hiddenCount: meals.length - 3,
  };
}

function getVisibleDesktopMonthMeals(meals: RecipeNutritionOnly[]) {
  if (meals.length <= 1) {
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

export default function MonthView({
  monthDates,
  dateToday,
  nutritionByDate = {},
  refetchTrigger,
  selectedDate,
  onDaySelect,
  userRole,
}: Props) {
  const [mealsByDayId, setMealsByDayId] = useState<Record<string, RecipeNutritionOnly[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const focusDate = monthDates[0] ?? new Date();
  const year = focusDate.getFullYear();
  const month = String(focusDate.getMonth() + 1).padStart(2, "0");

  const mobileMonthDates = useMemo(() => monthDates.filter((date) => !isWeekend(date)), [monthDates]);
  const firstMobileDate = mobileMonthDates[0] ?? focusDate;
  const mobileLeadingBlanks = Math.max(0, firstMobileDate.getDay() - 1);

  const mobileCells: Array<Date | null> = useMemo(
    () => [...Array.from({ length: mobileLeadingBlanks }, () => null), ...mobileMonthDates],
    [mobileLeadingBlanks, mobileMonthDates],
  );
  const paddedMobileCells: Array<Date | null> = useMemo(
    () => [...mobileCells, ...Array.from({ length: (5 - (mobileCells.length % 5)) % 5 }, () => null)],
    [mobileCells],
  );

  const desktopLeadingBlanks = focusDate.getDay();
  const desktopCells: Array<Date | null> = useMemo(
    () => [...Array.from({ length: desktopLeadingBlanks }, () => null), ...monthDates],
    [desktopLeadingBlanks, monthDates],
  );

  const mobileWeeks: Array<Array<Date | null>> = [];
  const desktopWeeks: Array<Array<Date | null>> = [];

  for (let i = 0; i < paddedMobileCells.length; i += 5) {
    mobileWeeks.push(paddedMobileCells.slice(i, i + 5));
  }

  for (let i = 0; i < desktopCells.length; i += 7) {
    desktopWeeks.push(desktopCells.slice(i, i + 7));
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
    <>
      <div className="mt-4 flex w-full flex-col gap-2 md:hidden">
        <div className="grid shrink-0 grid-cols-5 gap-2">
          {MOBILE_WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center font-montserrat text-[10px] font-semibold uppercase text-pepper">
              {label}
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {mobileWeeks.map((week, wi) => (
            <div key={wi} className="grid min-h-0 flex-1 grid-cols-5 gap-2">
              {week.map((date, di) => {
                if (!date) {
                  return <div key={`${wi}-${di}`} className="min-h-12 sm:min-h-16" aria-hidden />;
                }

                const dayId = formatCalendarDayId(date);
                const isToday = date.toDateString() === dateToday.toDateString();
                const isDaySelected = selectedDate ? isSameCalendarDay(date, selectedDate) : false;
                const meals = mealsByDayId[dayId] ?? [];
                const { visibleMeals, hiddenCount } = getVisibleMobileMonthMeals(meals);
                const nutritionSummary = nutritionByDate[dayId];
                const showWarning = Boolean(nutritionSummary) && !nutritionSummary?.quotaMet;

                const cellContent = (
                  <div className="flex h-full min-h-12 flex-col justify-end gap-1 pt-4 sm:min-h-16">
                    {isLoading ? (
                      <p className="truncate font-montserrat text-[10px] text-pepper/45">Loading...</p>
                    ) : visibleMeals.length > 0 ? (
                      <>
                        {visibleMeals.map((meal) => (
                          <MonthMealCard
                            key={`${dayId}-${meal._id}`}
                            item={meal}
                            dayId={dayId}
                            variant="bar"
                            userRole={userRole}
                          />
                        ))}

                        {hiddenCount > 0 ? (
                          <div className="flex h-3 min-w-4 items-center justify-center rounded-sm bg-jicama px-1 font-montserrat text-[9px] leading-none text-radish-900">
                            +{hiddenCount}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );

                const selectDay = () => {
                  onDaySelect(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                };

                return (
                  <div
                    key={dayId}
                    role="button"
                    tabIndex={0}
                    onClick={selectDay}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectDay();
                      }
                    }}
                    className={`relative min-h-12 overflow-visible rounded-md border border-medium-gray/20 bg-white sm:min-h-16 ${
                      isToday ? "ring-2 ring-radish-900" : ""
                    } ${isDaySelected && !isToday ? "ring-2 ring-radish-900" : ""} ${
                      isDaySelected && isToday ? "ring-2 ring-radish-900 ring-offset-2 ring-offset-gray-100" : ""
                    } cursor-pointer`}
                    aria-pressed={isDaySelected}
                    title="Click to select this day"
                  >
                    {userRole && showWarning ? (
                      <div className="absolute top-0.5 left-0.5 z-10 origin-top-left scale-75">
                        <WarningQuotaMonthly />
                      </div>
                    ) : null}

                    <span className="absolute top-1 right-1 z-10 font-montserrat text-[10px] font-semibold text-dark-gray sm:text-xs">
                      {String(date.getDate()).padStart(2, "0")}
                    </span>

                    <DroppableCalendarArea
                      dayId={dayId}
                      droppableId={`mobile-${dayId}`}
                      className="flex h-full w-full flex-col justify-end rounded-md p-1.5 transition-colors"
                    >
                      {cellContent}
                    </DroppableCalendarArea>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 hidden w-full flex-col gap-2 md:flex">
        <div className="grid shrink-0 grid-cols-7 gap-2">
          {DESKTOP_WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center font-montserrat text-xs font-medium uppercase text-dark-gray">
              {label}
            </div>
          ))}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {desktopWeeks.map((week, wi) => (
            <div key={wi} className="grid min-h-0 flex-1 grid-cols-7 gap-2">
              {week.map((date, di) => {
                if (!date) {
                  return <div key={`${wi}-${di}`} className="min-h-22.5" aria-hidden />;
                }

                const dayId = formatCalendarDayId(date);
                const weekend = isWeekend(date);
                const isToday = date.toDateString() === dateToday.toDateString();
                const inMonth = isSameMonth(date, focusDate);
                const isDaySelected = selectedDate ? isSameCalendarDay(date, selectedDate) : false;
                const meals = mealsByDayId[dayId] ?? [];
                const { visibleMeals, hiddenCount } = getVisibleDesktopMonthMeals(meals);
                const nutritionSummary = nutritionByDate[dayId];
                const showWarning = !weekend && Boolean(nutritionSummary) && !nutritionSummary?.quotaMet;

                const cellContent = (
                  <div className="flex min-h-22.5 flex-col items-start gap-1 p-2 pt-5">
                    {isLoading ? (
                      <p className="font-montserrat text-sm text-pepper/45">Loading...</p>
                    ) : visibleMeals.length > 0 ? (
                      <>
                        {visibleMeals.map((meal) => (
                          <MonthMealCard key={`${dayId}-${meal._id}`} item={meal} dayId={dayId} userRole={userRole} />
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

                const selectDay = () => {
                  if (weekend) return;
                  onDaySelect(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
                };

                return (
                  <div
                    key={dayId}
                    role={weekend ? undefined : "button"}
                    tabIndex={weekend ? undefined : 0}
                    onClick={weekend ? undefined : selectDay}
                    onKeyDown={
                      weekend
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              selectDay();
                            }
                          }
                    }
                    className={`relative min-h-22.5 overflow-visible rounded-xl border border-medium-gray ${
                      weekend ? "bg-medium-gray/35" : "bg-white"
                    } ${isToday ? "ring-2 ring-radish-900" : ""} ${
                      isDaySelected && !isToday ? "ring-2 ring-radish-600/80" : ""
                    } ${
                      isDaySelected && isToday ? "ring-2 ring-radish-900 ring-offset-2 ring-offset-gray-100" : ""
                    } ${inMonth ? "" : "opacity-60"} ${
                      weekend ? "pointer-events-none cursor-default select-none" : "cursor-pointer"
                    }`}
                    data-drop-disabled={weekend ? "true" : undefined}
                    aria-pressed={weekend ? undefined : isDaySelected}
                    title={weekend ? "Weekends — not available for planning or selection." : "Click to select this day"}
                  >
                    {userRole && showWarning ? (
                      <div className="absolute top-2 left-2 z-10">
                        <WarningQuotaMonthly />
                      </div>
                    ) : null}

                    <span className="absolute top-2 right-2 z-10 font-montserrat text-sm font-normal text-dark-gray">
                      {String(date.getDate()).padStart(2, "0")}
                    </span>

                    {weekend ? (
                      cellContent
                    ) : (
                      <DroppableCalendarArea dayId={dayId} droppableId={`desktop-${dayId}`}>
                        {cellContent}
                      </DroppableCalendarArea>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
