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
import { CategoryValue, EMPTY_FILTERS, Nutrition, Recipe, SortOption, Combo } from "@/lib/types";
import { NutritionSummary, emptyNutrition } from "@/lib/nutrition";
import { useMealData } from "@/hooks/useMealData";
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";

interface CalendarDay {
  _id: string;
  entrees: Recipe[];
  fruits: Recipe[];
  sides: Recipe[];
}

const today = new Date();

type CalendarItem = {
  _id?: string;
  id?: string;
  name: string;
  serving?: number;
  tags?: string[];
  itemType: "recipe" | "combo";
  entrees?: string[];
  sides?: string[];
  fruits?: string[];
};

type ActiveDragData = {
  id: string;
  recipeId?: string;
  name?: string;
  servingSize?: string;
  source?: string;
  tags?: string[];
  primaryTag?: string;
  itemType?: "recipe" | "combo";
  entrees?: string[];
  sides?: string[];
  fruits?: string[];
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

function CalendarDragPreview({ name, servingSize, primaryTag }: ActiveDragData) {
  return (
    <div className="flex w-56 items-center gap-3 rounded-md bg-radish-900 px-4 py-3 font-montserrat text-white shadow-lg">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold">{name}</p>
        {servingSize ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{servingSize}</p> : null}
      </div>
      {primaryTag ? <span className="shrink-0 text-xs font-medium">{primaryTag}</span> : null}
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
  } else if (view === "Week") {
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // start from Monday
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  } else if (view === "Month") {
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
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdDate");
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  const [recipes, setRecipes] = useState<CalendarItem[]>([]);
  const [recipeDropTrigger, setRecipeDropTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);
  const [nutritionByDate, setNutritionByDate] = useState<Record<string, NutritionSummary>>({});

  useEffect(() => {
    setDatesOffset(0);
  }, [calendarView]);

  const viewDates = getCurrentViewDates(getOffsetDate(today, datesOffset, calendarView), calendarView); // Day: 1 day, Week: 5 days, Month: 35 days (including prev/next month)
  const viewDateIds = viewDates.map(formatCalendarDayId);
  const viewDateKey = viewDateIds.join(",");
  const weeklyNutritionTotals: Nutrition[] = viewDateIds.map(
    (dateId) => nutritionByDate[dateId]?.nutritional_info ?? emptyNutrition(),
  );

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
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching nutrition totals:", error);
      }
    }

    fetchNutrition();

    return () => controller.abort();
  }, [viewDateKey, recipeDropTrigger]);

  const downloadMonthlyMenu = async () => {
    let currentMonth: number;
    let currentYear: number;
    if (calendarView === "Day") {
      currentMonth = viewDates[0].getMonth();
      currentYear = viewDates[0].getFullYear();
    } else if (calendarView === "Week") {
      currentMonth = viewDates[0].getMonth();
      currentYear = viewDates[0].getFullYear();
    } else {
      currentMonth = viewDates[10].getMonth();
      currentYear = viewDates[10].getFullYear();
    }

    try {
      const res = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const dates = await res.json();

      const data: IContent[] = [];

      dates.forEach((date: CalendarDay) => {
        const formattedDate = `${date._id.slice(0, 4)}-${date._id.slice(4, 6)}-${date._id.slice(6, 8)}`;
        const allItems = [...(date.entrees || []), ...(date.fruits || []), ...(date.sides || [])];

        // Calculate totals
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

        // Push individual items
        const pushItems = (items: Recipe[], type: string) => {
          items?.forEach((item) => {
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
        pushItems(date.entrees, "Entree");
        pushItems(date.fruits, "Fruit");
        pushItems(date.sides, "Side");

        // spacing
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

      const settings = { fileName: `${currentYear}_${(currentMonth + 1).toString().padStart(2, "0")}_MTC_Menu.xlsx` };
      xlsx(sheetData, settings);
    } catch (error) {
      console.error("Error downloading monthly menu:", error);
    }
  };

  const toggleCategory = (category: CategoryValue) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);

      if (category === "Combo") {
        if (next.has("Combo")) return new Set<CategoryValue>();
        return new Set<CategoryValue>(["Combo"]);
      }

      if (next.has("Combo")) next.delete("Combo");

      if (next.has(category)) next.delete(category);
      else next.add(category);

      return next;
    });
  };

  const { items, loading, error, currentPage, totalPages, setCurrentPage } = useMealData({
    search,
    filters: EMPTY_FILTERS,
    selectedCategories,
    draftMode: false,
    sortBy,
  });

  useEffect(() => {
    async function fetchRecipesAndCombos() {
      try {
        const [recipesRes, combosRes] = await Promise.all([
          fetch("/api/recipes?isDraft=false&limit=200"),
          fetch("/api/combos?isDraft=false&limit=200"),
        ]);

        if (!recipesRes.ok || !combosRes.ok) {
          throw new Error("Failed to fetch recipes or combos");
        }

        const [recipesJson, combosJson] = await Promise.all([recipesRes.json(), combosRes.json()]);

        const recipeItems: CalendarItem[] = (recipesJson.data ?? []).map((recipe: Recipe) => ({
          ...recipe,
          itemType: "recipe",
          tags: recipe.filters ?? ["Entree"],
        }));

        const comboItems: CalendarItem[] = (combosJson.data ?? []).map((combo: Combo) => ({
          ...combo,
          itemType: "combo",
          tags: ["Combo"],
          entrees: combo.entrees ?? [],
          sides: combo.sides ?? [],
          fruits: combo.fruits ?? [],
        }));

        setRecipes([...recipeItems, ...comboItems]);
      } catch (error) {
        console.error(error);
      }
    }

    fetchRecipesAndCombos();
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveDragData({
      id: event.active.id as string,
      ...(event.active.data.current as Omit<ActiveDragData, "id">),
    });
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveDragData(null);

    if (!over) {
      return;
    }

    const dragData = active.data.current as any;
    const dropData = over.data.current as any;

    if (dragData?.type === "recipe" && dropData?.type === "trash") {
      if (dragData.source !== "calendar") {
        return;
      }

      const { recipeId, dayId, category } = dragData;

      if (!recipeId || !dayId || !category) {
        console.error("Invalid calendar recipe drag data:", dragData);
        return;
      }

      try {
        const response = await fetch(`/api/calendar/${dayId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId, category }),
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

    const { recipeId, tags, primaryTag, itemType, entrees = [], sides = [], fruits = [] } = dragData;
    const { dayId } = dropData;

    if (!recipeId || typeof recipeId !== "string" || recipeId.trim() === "") {
      console.error("Invalid recipe ID found in drag data:", dragData);
      return;
    }

    type CalendarCategory = "entrees" | "sides" | "fruits";

    const rawTags = Array.isArray(tags) ? tags : tags ? [tags] : [primaryTag || "Entree"];
    const normalizedTags = rawTags.map((tag) => tag?.toString().trim().toLowerCase()).filter(Boolean);

    const mapTagToCategory = (tag: string): CalendarCategory | undefined => {
      switch (tag) {
        case "entree":
        case "entrée":
        case "entrees":
          return "entrees";
        case "side":
        case "sides":
          return "sides";
        case "fruit":
        case "fruits":
          return "fruits";
        default:
          return undefined;
      }
    };

    const calendarItemsToAdd: Array<{ recipeId: string; category: CalendarCategory }> =
      itemType === "combo"
        ? [
            ...entrees.map((id: string) => ({ recipeId: id, category: "entrees" as const })),
            ...sides.map((id: string) => ({ recipeId: id, category: "sides" as const })),
            ...fruits.map((id: string) => ({ recipeId: id, category: "fruits" as const })),
          ].filter((item) => item.recipeId && item.recipeId.trim() !== "")
        : [
            {
              recipeId,
              category: normalizedTags.map(mapTagToCategory).find(Boolean) ?? "entrees",
            },
          ];

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

      // Trigger refetch in WeekView
      setRecipeDropTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding recipe to calendar:", error);
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveDragData(null);
  }, []);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <main className="flex flex-row">
        <div className="flex flex-1 justify-center items-center bg-gray-100">
          <div className="flex flex-col h-full w-260">
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center justify-center gap-2">
                <CurrentDateButton onClick={() => setDatesOffset(0)} />
                <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset - 1)}>
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <span className="font-bold text-xl">
                  {calendarView === "Day" &&
                    `${viewDates[0].toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
                  {calendarView === "Week" &&
                    `${viewDates[0].toLocaleDateString(undefined, { month: "long" })} ${viewDates[0].getDate()} - ${viewDates[4].toLocaleDateString(undefined, { month: "long" })} ${viewDates[4].getDate()}`}
                  {calendarView === "Month" &&
                    viewDates[10].toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </span>
                <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset + 1)}>
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-row">
                <div className="flex bg-white rounded-md w-fit">
                  <button
                    className={`cursor-pointer px-4 py-1 rounded-md font-semibold text-black ${calendarView === "Month" ? "bg-radish-900 text-white" : ""}`}
                    onClick={() => setCalendarView("Month")}
                  >
                    Month
                  </button>
                  <button
                    className={`cursor-pointer px-4 py-1 rounded-md font-semibold ${calendarView === "Week" ? "bg-radish-900 text-white" : "text-black"}`}
                    onClick={() => setCalendarView("Week")}
                  >
                    Week
                  </button>
                  <button
                    className={`cursor-pointer px-4 py-1 rounded-md font-semibold text-black ${calendarView === "Day" ? "bg-radish-900 text-white" : ""}`}
                    onClick={() => setCalendarView("Day")}
                  >
                    Day
                  </button>
                </div>

                <span className="bg-radish-900 rounded-md p-2 ml-2">
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
                <MonthView
                  monthDates={viewDates}
                  dateToday={today}
                  nutritionByDate={nutritionByDate}
                  refetchTrigger={recipeDropTrigger}
                />
                <div className="mt-auto flex justify-end pb-4">
                  <TrashDropZone />
                </div>
              </div>
            )}

            {calendarView === "Week" && (
              <>
                <WeekView
                  dateToday={today}
                  weekDates={viewDates}
                  refetchTrigger={recipeDropTrigger}
                  nutritionByDate={nutritionByDate}
                />
                <div className="mt-auto flex justify-end pb-4">
                  <TrashDropZone />
                </div>
                <WeeklyNutritionQuota dailyTotals={weeklyNutritionTotals} />
              </>
            )}

            {calendarView === "Day" && (
              <>
                <DayView date={viewDates[0]} refetchTrigger={recipeDropTrigger} />
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
            onToggleCategory={toggleCategory}
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
            {(() => {
              if (activeDragData?.source === "calendar") {
                return <CalendarDragPreview {...activeDragData} />;
              }

              const activeRecipe = recipes.find((r) => (r._id || r.id) === activeId?.replace("recipe-", ""));
              return activeRecipe ? (
                <DraggableRecipeCard
                  recipeId={activeRecipe._id || activeRecipe.id || ""}
                  imageUrl=""
                  name={activeRecipe.name}
                  calories={0}
                  servingSize={activeRecipe.serving ? `${activeRecipe.serving} servings` : "100g"}
                  tags={activeRecipe.tags}
                  disabled={true}
                />
              ) : null;
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
