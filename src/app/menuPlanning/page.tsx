"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDroppable } from "@dnd-kit/core";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import WeeklyNutritionQuota from "@/components/menuPlanning/WeeklyNutritionQuota";
import DraggableRecipeCard from "@/components/menuPlanning/DraggableRecipeCard";
import MonthView from "@/components/menuPlanning/MonthView";
import DayView, { DayMealCardPreview } from "@/components/menuPlanning/DayView";
import CurrentDateButton from "@/components/CurrentDateButton";
import { ChevronDown, ChevronLeft, ChevronRight, ArrowDownToLine, GripVertical, Trash2 } from "lucide-react";
import {
  Combo,
  CategoryValue,
  Nutrition,
  Recipe,
  RecipeBucket,
  RECIPE_BUCKETS,
  createEmptyFilterSelections,
  CATEGORY_TO_BUCKET,
  RecipeNutritionOnly,
} from "@/lib/types";
import { NutritionSummary, emptyNutrition } from "@/lib/nutrition";
import { useMealData } from "@/hooks/useMealData";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import { downloadMenuPlanningExportForView } from "@/lib/menuPlanningExport";
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";
import { toggleCategory } from "@/lib/helpers";
import { MonthMealCardPreview } from "@/components/menuPlanning/MonthMealCard";

const today = new Date();
// Dummy per-day nutrition totals for the week (Mon–Fri), mocking backend data
const DUMMY_WEEKLY_NUTRITION: Nutrition[] = [
  { calories: 380, protein: 27, fat: 10, carbs: 49, fiber: 9, sodium: 520 }, // Mon
  { calories: 420, protein: 30, fat: 12, carbs: 55, fiber: 8, sodium: 610 }, // Tue
  { calories: 350, protein: 24, fat: 9, carbs: 44, fiber: 7, sodium: 490 }, // Wed
  { calories: 410, protein: 28, fat: 11, carbs: 52, fiber: 9, sodium: 580 }, // Thu
  { calories: 390, protein: 25, fat: 10, carbs: 48, fiber: 8, sodium: 530 }, // Fri
];

export type SidebarDragData =
  | {
      source: "sidebar";
      itemType: "recipe";
      item: Recipe;
    }
  | {
      source: "sidebar";
      itemType: "combo";
      item: Combo;
    };

export type CalendarDragData = {
  source: "calendar";
  item: RecipeNutritionOnly;
  dayId: string;
};

export type ActiveDragData = SidebarDragData | CalendarDragData;

export type DropZoneData =
  | {
      dest: "calendar";
      dayId: string;
    }
  | {
      dest: "trash";
    }
  | {
      dest: "sidebar";
    };

function TrashDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash",
    data: { dest: "trash" },
  });

  return (
    // some padding around the button to make the droppable area larger
    <div
      ref={setNodeRef}
      className="flex h-16 w-16 items-center justify-center sm:h-24 sm:w-24"
      aria-label="Trash drop zone"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full bg-radish-900 text-white shadow-lg transition sm:h-14 sm:w-14 ${
          isOver ? "scale-105 ring-4 ring-radish-900/20" : ""
        }`}
        aria-label="Trash"
      >
        <Trash2 size={24} strokeWidth={2.2} />
      </div>
    </div>
  );
}

function SidebarDropZone({ children }: { children: ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: "sidebar",
    data: { type: "sidebar" },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex w-full min-w-0 flex-col bg-gray-100 px-4 pb-4 lg:w-90 lg:shrink-0 lg:bg-white lg:px-0 lg:pb-0"
    >
      {children}
    </div>
  );
}

function CalendarDragPreview({ item }: CalendarDragData) {
  return (
    <div className="flex w-56 items-center gap-3 rounded-md bg-radish-900 px-4 py-3 font-montserrat text-white shadow-lg">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold">{item.name}</p>
        {item.serving ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{item.serving}</p> : null}
      </div>

      {item.category ? <span className="shrink-0 text-xs font-medium">{item.category}</span> : null}

      <GripVertical className="h-5 w-5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}

const getOffsetDate = (date: Date, offset: number, view: "Month" | "Week" | "Day") => {
  const newDate = new Date(date);

  if (view === "Day") {
    newDate.setDate(date.getDate() + offset);
  } else if (view === "Week") {
    newDate.setDate(date.getDate() + offset * 7);
  } else if (view === "Month") {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  return newDate;
};

const getCurrentViewDates = (today: Date, view: "Month" | "Week" | "Day") => {
  if (view === "Day") {
    return [today];
  }

  if (view === "Week") {
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // start from Monday

    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  if (view === "Month") {
    // Only in-month dates (1..last). The MonthView adds leading blanks for alignment
    // but does not force a 6x7 (42) grid.
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return Array.from(
      { length: lastDay },
      (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i + 1),
    );
  }

  return [];
};

const formatCalendarDayId = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export default function MenuPlanning() {
  const [planningRoot] = useState(() => new Date());
  const dateToday = new Date();
  const [search, setSearch] = useState("");
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);
  const [pickedDateFromMonth, setPickedDateFromMonth] = useState<Date | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [filters] = useState(() => createEmptyFilterSelections());
  const [exportFormat, setExportFormat] = useState<"Display" | "Nutritional">("Nutritional");

  const [recipeDropTrigger, setRecipeDropTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);
  const [nutritionByDate, setNutritionByDate] = useState<Record<string, NutritionSummary>>({});

  const previousCalendarView = useRef(calendarView);

  useEffect(() => {
    const prev = previousCalendarView.current;
    previousCalendarView.current = calendarView;
    if (calendarView === "Month" && prev !== "Month" && pickedDateFromMonth) {
      const p = pickedDateFromMonth;
      const monthDiff = (p.getFullYear() - planningRoot.getFullYear()) * 12 + (p.getMonth() - planningRoot.getMonth());
      setDatesOffset(monthDiff);
      return;
    }
    if (prev !== calendarView) {
      setDatesOffset(0);
    }
  }, [calendarView, pickedDateFromMonth, planningRoot]);
  const offsetAnchor = getOffsetDate(planningRoot, datesOffset, calendarView);
  const monthAnchor = getOffsetDate(planningRoot, datesOffset, "Month");
  const weekDayAnchor =
    (calendarView === "Week" || calendarView === "Day") && pickedDateFromMonth ? pickedDateFromMonth : offsetAnchor;

  const viewDates =
    calendarView === "Month"
      ? getCurrentViewDates(monthAnchor, "Month")
      : getCurrentViewDates(weekDayAnchor, calendarView);

  const viewDateIds = viewDates.map(formatCalendarDayId);

  const viewDateKey = viewDateIds.join(",");

  const weeklyNutritionTotals: Nutrition[] = viewDateIds.map(
    (dateId) => nutritionByDate[dateId]?.nutritional_info ?? emptyNutrition(),
  );

  const bumpDatesOffset = (delta: number) => {
    setPickedDateFromMonth(null);
    setDatesOffset((d) => d + delta);
  };

  const resetToPlanningToday = () => {
    setPickedDateFromMonth(null);
    setDatesOffset(0);
  };

  useEffect(() => {
    if (!viewDateKey) {
      setNutritionByDate({});
      return;
    }

    const controller = new AbortController();

    async function fetchNutrition() {
      try {
        const res = await fetch(`/api/calendar/nutrition?ids=${encodeURIComponent(viewDateKey)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch nutrition totals (${res.status})`);
        }

        const body: { data?: NutritionSummary[] } = await res.json();

        const summaries = body.data ?? [];

        if (!controller.signal.aborted) {
          setNutritionByDate(
            summaries.reduce<Record<string, NutritionSummary>>((acc, summary) => {
              acc[summary._id] = summary;
              return acc;
            }, {}),
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching nutrition totals:", error);
      }
    }
    fetchNutrition();
    return () => controller.abort();
  }, [viewDateKey, recipeDropTrigger]);

  const downloadMonthlyMenu = async () => {
    const baseDate = viewDates[0] ?? planningRoot;
    const currentMonth = baseDate.getMonth();
    const currentYear = baseDate.getFullYear();

    try {
      await downloadMenuPlanningExportForView({ calendarView, viewDates, format: exportFormat });
    } catch (error) {
      console.error("Error downloading monthly menu:", error);
    }
  };

  const { items, loading, error, currentPage, totalPages, setCurrentPage } = useMealData({
    search,
    filters, // TODO: can add filtering support to recipeDatabase
    selectedCategories,
    draftMode: false,
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveDragData({
      ...(event.active.data.current as ActiveDragData),
    });
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragData(null);

    if (!over) return;

    const dragData = active.data.current as ActiveDragData | undefined;
    const dropData = over.data.current as DropZoneData | undefined;

    if (!dragData || !dropData) {
      return;
    }

    if (dragData.source === "calendar" && dropData.dest === "trash") {
      const { item, dayId } = dragData;

      try {
        const response = await fetch(`/api/calendar/${dayId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: item._id,
            category: CATEGORY_TO_BUCKET[item.category],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(`Failed to delete recipe from calendar: ${response.status}`);
        }

        setRecipeDropTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting recipe from calendar:", error);
      }

      return;
    }

    if (dropData.dest !== "calendar") {
      // dropping into the sidebar does nothing
      // dopping into trash is handled above, dropping into calendar is handled below
      return;
    }

    if (dragData.source === "calendar") {
      // Dragging from the calendar into anywhere else does nothing.
      // E.g: cannot move a recipe between different days.
      return;
    }

    const { dayId } = dropData; // here we are guaranteed to be dropped into calendar

    if (!dayId) {
      console.error("Missing calendar day id:", dropData);
      return;
    }

    const calendarItemsToAdd: Array<{ recipeId: string; category: RecipeBucket }> =
      // if combo, add the recipes in the combo. Otherwise just add the recipe.
      dragData.itemType === "combo"
        ? RECIPE_BUCKETS.flatMap((bucket) =>
            (dragData.item[bucket] ?? [])
              .filter((recipeId): recipeId is string => Boolean(recipeId?.trim()))
              .map((recipeId) => ({ recipeId, category: bucket })),
          )
        : [{ recipeId: dragData.item._id, category: CATEGORY_TO_BUCKET[dragData.item.category] }];

    if (calendarItemsToAdd.length === 0) {
      console.error("No valid recipes found in dragged item:", dragData);
      return;
    }

    try {
      const responses = await Promise.all(
        calendarItemsToAdd.map((item) =>
          fetch(`/api/calendar/${dayId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          }),
        ),
      );

      const failedResponse = responses.find((response) => !response.ok);

      if (failedResponse) {
        const errorData = await failedResponse.json();
        console.error("API error:", errorData);
        throw new Error(`Failed to add recipe to calendar: ${failedResponse.status}`);
      }

      setRecipeDropTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding recipe to calendar:", error);
    }
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveDragData(null);
  }, []);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <main className="flex min-h-0 flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
        <div className="flex w-full min-w-0 justify-center bg-gray-100 px-4 py-4 sm:px-6 lg:flex-1 lg:overflow-auto lg:px-4">
          <div className="flex w-full max-w-[1040px] flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1 sm:gap-2">
                <div className="hidden sm:block">
                  <CurrentDateButton onClick={resetToPlanningToday} />
                </div>

                <button
                  type="button"
                  className="shrink-0 cursor-pointer rounded-md p-1 hover:bg-white"
                  onClick={() => bumpDatesOffset(-1)}
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                <span className="min-w-0 truncate text-[15px] font-bold sm:text-xl">
                  {calendarView === "Day" &&
                    `${viewDates[0].toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}`}

                  {calendarView === "Week" &&
                    `${viewDates[0].toLocaleDateString(undefined, { month: "long" })} ${viewDates[0].getDate()} - ${viewDates[4].toLocaleDateString(undefined, { month: "long" })} ${viewDates[4].getDate()}`}

                  {calendarView === "Month" &&
                    viewDates[0].toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                </span>

                <button
                  type="button"
                  className="shrink-0 cursor-pointer rounded-md p-1 hover:bg-white"
                  onClick={() => bumpDatesOffset(1)}
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="relative">
                  <select
                    value={calendarView}
                    onChange={(e) => setCalendarView(e.target.value as "Month" | "Week" | "Day")}
                    className="cursor-pointer appearance-none rounded-md bg-radish-900 py-1.5 pr-8 pl-3 text-sm font-bold text-white outline-none sm:px-4 sm:pr-9 sm:text-base"
                    aria-label="Calendar view"
                  >
                    <option value="Month">Month</option>
                    <option value="Week">Week</option>
                    <option value="Day">Day</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-white"
                    aria-hidden="true"
                  />
                </div>

                <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 sm:ml-2 sm:flex sm:flex-none">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as "Display" | "Nutritional")}
                    className="min-w-0 flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black sm:flex-none sm:text-base"
                  >
                    <option value="Nutritional">Nutritional</option>
                    <option value="Display">Display</option>
                  </select>
                  <span className="shrink-0 rounded-md bg-radish-900 p-2">
                    <ArrowDownToLine
                      className="cursor-pointer"
                      color="white"
                      size={20}
                      strokeWidth={2.5}
                      onClick={downloadMonthlyMenu}
                    />
                  </span>
                </div>
              </div>
            </div>

            {calendarView === "Month" && (
              <>
                <MonthView
                  monthDates={viewDates}
                  dateToday={today}
                  nutritionByDate={nutritionByDate}
                  refetchTrigger={recipeDropTrigger}
                  selectedDate={pickedDateFromMonth}
                  onDaySelect={setPickedDateFromMonth}
                />

                <div className="mt-2 hidden sm:block">
                  <WarningQuotaMonthly />
                </div>

                <div className="mt-2 hidden justify-end pb-2 sm:mt-auto sm:flex sm:pb-4">
                  <TrashDropZone />
                </div>
              </>
            )}

            {calendarView === "Week" && (
              <>
                <WeekView
                  dateToday={dateToday}
                  weekDates={viewDates}
                  refetchTrigger={recipeDropTrigger}
                  selectedDate={pickedDateFromMonth}
                  nutritionByDate={nutritionByDate}
                />

                <div className="mt-2 flex justify-end pb-2 sm:mt-auto sm:pb-4">
                  <TrashDropZone />
                </div>
                <WeeklyNutritionQuota dailyTotals={weeklyNutritionTotals} />
              </>
            )}

            {calendarView === "Day" && (
              <>
                <DayView date={viewDates[0]} refetchTrigger={recipeDropTrigger} />
                <div className="mt-2 hidden justify-end sm:flex">
                  <TrashDropZone />
                </div>
              </>
            )}
          </div>
        </div>

        <SidebarDropZone>
          <RecipeDatabase
            items={items}
            loading={loading}
            error={error}
            onSearch={setSearch}
            selectedCategories={selectedCategories}
            onToggleCategory={(category: CategoryValue) => toggleCategory(category, setSelectedCategories)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </SidebarDropZone>
      </main>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-80">
            {activeDragData?.source === "calendar" ? (
              calendarView === "Month" ? (
                <MonthMealCardPreview item={activeDragData.item} />
              ) : calendarView === "Day" ? (
                <DayMealCardPreview item={activeDragData.item} />
              ) : (
                <CalendarDragPreview {...activeDragData} />
              )
            ) : activeDragData?.item ? (
              <DraggableRecipeCard item={activeDragData.item} disabled />
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
