"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDroppable } from "@dnd-kit/core";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import WeeklyNutritionQuota from "@/components/menuPlanning/WeeklyNutritionQuota";
import DraggableRecipeCard from "@/components/menuPlanning/DraggableRecipeCard";
import MonthView from "@/components/menuPlanning/MonthView";
import DayView from "@/components/menuPlanning/DayView";
import CurrentDateButton from "@/components/CurrentDateButton";
import { ChevronLeft, ChevronRight, ArrowDownToLine, GripVertical, Trash2 } from "lucide-react";
import {
  CalendarDay,
  Combo,
  EMPTY_FILTERS,
  CategoryValue,
  Nutrition,
  Recipe,
  RecipeBucket,
  RecipeCategory,
  RECIPE_BUCKETS,
  SortOption,
} from "@/lib/types";
import { useMealData } from "@/hooks/useMealData";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";
import { toggleCategory } from "@/lib/helpers";

// TODO: too much code in this file, first fix categories. Later will will find a way to improve.
const today = new Date();

// Dummy per-day nutrition totals for the week (Mon–Fri), mocking backend data
const DUMMY_WEEKLY_NUTRITION: Nutrition[] = [
  { calories: 380, protein: 27, fat: 10, carbs: 49, fiber: 9, sodium: 520 }, // Mon
  { calories: 420, protein: 30, fat: 12, carbs: 55, fiber: 8, sodium: 610 }, // Tue
  { calories: 350, protein: 24, fat: 9, carbs: 44, fiber: 7, sodium: 490 }, // Wed
  { calories: 410, protein: 28, fat: 11, carbs: 52, fiber: 9, sodium: 580 }, // Thu
  { calories: 390, protein: 25, fat: 10, carbs: 48, fiber: 8, sodium: 530 }, // Fri
];

type ActiveDragData = {
  id: string;
  type?: string;
  source?: "sidebar" | "calendar";
  itemType?: "recipe" | "combo";

  recipeId?: string;
  comboId?: string;
  dayId?: string;

  name?: string;
  servingSize?: string;

  bucket?: RecipeBucket;
  category?: CategoryValue;
  recipeCategory?: RecipeCategory;

  entrees?: string[];
  vegetables?: string[];
  fruits?: string[];
  grains?: string[];

  item?: Recipe | Combo;
};

function TrashDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: "calendar-trash",
    data: { type: "trash" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex h-14 w-14 items-center justify-center rounded-full bg-radish-900 text-white shadow-lg transition ${
        isOver ? "scale-105 ring-4 ring-radish-900/20" : ""
      }`}
      aria-label="Trash"
    >
      <Trash2 size={24} strokeWidth={2.2} />
    </div>
  );
}

function SidebarDropZone({ children }: { children: ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: "recipe-sidebar",
    data: { type: "sidebar" },
  });

  return (
    <div ref={setNodeRef} className="w-90">
      {children}
    </div>
  );
}

function CalendarDragPreview({ name, servingSize, category, recipeCategory }: ActiveDragData) {
  const displayCategory = category ?? recipeCategory;

  return (
    <div className="flex w-56 items-center gap-3 rounded-md bg-radish-900 px-4 py-3 font-montserrat text-white shadow-lg">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold">{name}</p>
        {servingSize ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{servingSize}</p> : null}
      </div>

      {displayCategory ? <span className="shrink-0 text-xs font-medium">{displayCategory}</span> : null}

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

export default function MenuPlanning() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdDate");
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));

  const [recipeDropTrigger, setRecipeDropTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);

  useEffect(() => {
    setDatesOffset(0);
  }, [calendarView]);

  // Day: 1 day, Week: 5 days, Month: 35 days (including prev/next month)
  const viewDates = getCurrentViewDates(getOffsetDate(today, datesOffset, calendarView), calendarView);

  const downloadMonthlyMenu = async () => {
    const baseDate = calendarView === "Month" ? viewDates[10] : viewDates[0];
    const currentMonth = baseDate.getMonth();
    const currentYear = baseDate.getFullYear();

    try {
      const res = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch monthly menu: ${res.status}`);
      }

      const dates: CalendarDay[] = await res.json();
      const data: IContent[] = [];

      dates.forEach((date) => {
        const formattedDate = `${date._id.slice(0, 4)}-${date._id.slice(4, 6)}-${date._id.slice(6, 8)}`;

        const allItems = [
          ...(date.entrees || []),
          ...(date.vegetables || []),
          ...(date.fruits || []),
          ...(date.grains || []),
        ];

        const totals = allItems.reduce(
          (acc, item) => {
            acc.calorie += item.nutritional_info.calories || 0;
            acc.protein += item.nutritional_info.protein || 0;
            acc.fat += item.nutritional_info.fat || 0;
            acc.carbs += item.nutritional_info.carbs || 0;
            acc.fiber += item.nutritional_info.fiber || 0;
            acc.sodium += item.nutritional_info.sodium || 0;
            return acc;
          },
          {
            name: formattedDate,
            serving: "",
            calorie: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            fiber: 0,
            sodium: 0,
          },
        );

        data.push(totals);

        const pushItems = (items: Recipe[] = []) => {
          items.forEach((item) => {
            data.push({
              name: item.name,
              serving: item.serving,
              calorie: item.nutritional_info.calories,
              protein: item.nutritional_info.protein,
              fat: item.nutritional_info.fat,
              carbs: item.nutritional_info.carbs,
              fiber: item.nutritional_info.fiber,
              sodium: item.nutritional_info.sodium,
            });
          });
        };

        pushItems(date.entrees);
        pushItems(date.vegetables);
        pushItems(date.fruits);
        pushItems(date.grains);

        data.push({
          name: "",
          serving: "",
          calorie: "",
          protein: "",
          fat: "",
          carbs: "",
          fiber: "",
          sodium: "",
        });
      });

      const sheetData: IJsonSheet[] = [
        {
          sheet: "Menu",
          columns: [
            { label: "Item Name", value: "name" },
            { label: "Serving", value: "serving" },
            { label: "Cals (kcal)", value: "calorie" },
            { label: "Prot (g)", value: "protein" },
            { label: "Fat (g)", value: "fat" },
            { label: "Carbs (g)", value: "carbs" },
            { label: "Fiber (g)", value: "fiber" },
            { label: "Sodium (mg)", value: "sodium" },
          ],
          content: data,
        },
      ];

      const settings = {
        fileName: `${currentYear}_${(currentMonth + 1).toString().padStart(2, "0")}_MTC_Menu.xlsx`,
      };

      xlsx(sheetData, settings);
    } catch (error) {
      console.error("Error downloading monthly menu:", error);
    }
  };

  const { items, loading, error, currentPage, totalPages, setCurrentPage } = useMealData({
    search,
    filters: EMPTY_FILTERS,
    selectedCategories,
    draftMode: false,
    sortBy,
  });

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveDragData({
      id: event.active.id as string,
      ...(event.active.data.current as Omit<ActiveDragData, "id">),
    });
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragData(null);

    if (!over) return;

    const dragData = active.data.current as ActiveDragData | undefined;
    const dropData = over.data.current as { type?: string; dayId?: string } | undefined;

    if (dragData?.type === "recipe" && dragData.source === "calendar" && dropData?.type === "trash") {
      const { recipeId, dayId, bucket } = dragData;

      if (!recipeId || !dayId || !bucket) {
        console.error("Invalid calendar recipe drag data:", dragData);
        return;
      }

      try {
        const response = await fetch(`/api/calendar/${dayId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId,
            category: bucket,
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

    if (dragData?.type !== "recipe" || dropData?.type !== "calendar") {
      return;
    }

    if (dragData.source === "calendar") {
      return;
    }

    const { dayId } = dropData;

    if (!dayId) {
      console.error("Missing calendar day id:", dropData);
      return;
    }

    const calendarItemsToAdd: Array<{ recipeId: string; category: RecipeBucket }> =
      dragData.itemType === "combo"
        ? RECIPE_BUCKETS.flatMap((bucket) =>
            (dragData[bucket] ?? [])
              .filter((recipeId): recipeId is string => Boolean(recipeId?.trim()))
              .map((recipeId) => ({ recipeId, category: bucket })),
          )
        : dragData.recipeId && dragData.bucket
          ? [{ recipeId: dragData.recipeId, category: dragData.bucket }]
          : [];

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
            body: JSON.stringify({
              recipeId: item.recipeId,
              category: item.category,
            }),
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
      <main className="flex flex-row">
        <div className="flex flex-1 items-center justify-center bg-gray-100">
          <div className="flex h-full w-260 flex-col">
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center justify-center gap-2">
                <CurrentDateButton onClick={() => setDatesOffset(0)} />

                <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset - 1)}>
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                <span className="text-xl font-bold">
                  {calendarView === "Day" &&
                    `${viewDates[0].toLocaleDateString(undefined, {
                      weekday: "long",
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

                <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset + 1)}>
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-row">
                <div className="flex w-fit rounded-md bg-white">
                  <button
                    className={`cursor-pointer rounded-md px-4 py-1 font-semibold text-black ${
                      calendarView === "Month" ? "bg-radish-900 text-white" : ""
                    }`}
                    onClick={() => setCalendarView("Month")}
                  >
                    Month
                  </button>

                  <button
                    className={`cursor-pointer rounded-md px-4 py-1 font-semibold ${
                      calendarView === "Week" ? "bg-radish-900 text-white" : "text-black"
                    }`}
                    onClick={() => setCalendarView("Week")}
                  >
                    Week
                  </button>

                  <button
                    className={`cursor-pointer rounded-md px-4 py-1 font-semibold text-black ${
                      calendarView === "Day" ? "bg-radish-900 text-white" : ""
                    }`}
                    onClick={() => setCalendarView("Day")}
                  >
                    Day
                  </button>
                </div>

                <span className="ml-2 rounded-md bg-radish-900 p-2">
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

            {calendarView === "Month" && (
              <div className="flex min-h-0 flex-1 flex-col">
                <MonthView monthDates={viewDates} dateToday={today} />

                <div className="mt-2">
                  <WarningQuotaMonthly />
                </div>

                <div className="mt-auto flex justify-end pb-4">
                  <TrashDropZone />
                </div>
              </div>
            )}

            {calendarView === "Week" && (
              <>
                <WeekView dateToday={today} weekDates={viewDates} refetchTrigger={recipeDropTrigger} />

                <div className="mt-auto flex justify-end pb-4">
                  <TrashDropZone />
                </div>

                <WeeklyNutritionQuota dailyTotals={DUMMY_WEEKLY_NUTRITION} />
              </>
            )}

            {calendarView === "Day" && <DayView date={viewDates[0]} refetchTrigger={recipeDropTrigger} />}
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
            sortBy={sortBy}
            onSortChange={setSortBy}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </SidebarDropZone>
      </main>

      <DragOverlay>
        {activeId ? (
          <div className="rotate-3 opacity-90">
            {activeDragData?.source === "calendar" ? (
              <CalendarDragPreview {...activeDragData} />
            ) : activeDragData?.item ? (
              <DraggableRecipeCard item={activeDragData.item} disabled />
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
