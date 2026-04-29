"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import WeeklyNutritionQuota from "@/components/menuPlanning/WeeklyNutritionQuota";
import DraggableRecipeCard from "@/components/menuPlanning/DraggableRecipeCard";
import MonthView from "@/components/menuPlanning/MonthView";
import CurrentDateButton from "@/components/CurrentDateButton";
import RecipeDailyCard from "@/components/RecipeDailyCard";
import DayView from "@/components/menuPlanning/DayView";
import RecipeMonthlyCard from "@/components/RecipeMonthlyCard";
import MonthView from "@/components/menuPlanning/MonthView";
import RecipeDailyCard from "@/components/RecipeDailyCard";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";
import { CategoryValue, EMPTY_FILTERS, Nutrition, Recipe, SortOption, Combo } from "@/lib/types";
import { useMealData } from "@/hooks/useMealData";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";

interface CalendarDay {
  _id: string;
  entrees: Recipe[];
  fruits: Recipe[];
  sides: Recipe[];
}

const today = new Date();
const SAMPLE_RECIPES: Recipe[] = [
  {
    item: null,
    _id: "oo",
    name: "Chicken Tikka Masala",
    serving: 150,
    filters: ["Entree"],
    isDraft: false,
    nutritional_info: { calories: 225, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
  {
    item: null,
    _id: "sample-mango-cup",
    name: "Mango Cup",
    serving: 100,
    filters: ["Fruit"],
    isDraft: false,
    nutritional_info: { calories: 100, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
  {
    item: null,
    _id: "sample-brown-rice",
    name: "Brown Rice",
    serving: 150,
    filters: ["Sides"],
    isDraft: false,
    nutritional_info: { calories: 200, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
];

// Dummy per-day nutrition totals for the week (Mon–Fri), mocking backend data
const DUMMY_WEEKLY_NUTRITION: Nutrition[] = [
  { calories: 380, protein: 27, fat: 10, carbs: 49, fiber: 9, sodium: 520 }, // Mon
  { calories: 420, protein: 30, fat: 12, carbs: 55, fiber: 8, sodium: 610 }, // Tue
  { calories: 350, protein: 24, fat: 9, carbs: 44, fiber: 7, sodium: 490 }, // Wed
  { calories: 410, protein: 28, fat: 11, carbs: 52, fiber: 9, sodium: 580 }, // Thu
  { calories: 390, protein: 25, fat: 10, carbs: 48, fiber: 8, sodium: 530 }, // Fri
];

type CalendarItem = {
  _id?: string;
  id?: string;
  name: string;
  serving?: number;
  tags?: string[];
  itemType: "recipe" | "combo";
  sides?: string[];
  fruits?: string[];
};

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

export default function MenuPlanning() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdDate");
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  const [recipes, setRecipes] = useState<CalendarItem[]>([]);
  const [recipeDropTrigger, setRecipeDropTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setDatesOffset(0);
  }, [calendarView]);

  const viewDates = getCurrentViewDates(getOffsetDate(today, datesOffset, calendarView), calendarView); // Day: 1 day, Week: 5 days, Month: 35 days (including prev/next month)

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
          tags: ["Combo", ...(combo.sides?.length ? ["Side"] : []), ...(combo.fruits?.length ? ["Fruit"] : [])],
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
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const dragData = active.data.current as any;
    const dropData = over.data.current as any;

    if (dragData?.type !== "recipe" || dropData?.type !== "calendar") {
      return;
    }

    const { recipeId, tags, primaryTag, itemType, sides = [], fruits = [] } = dragData;
    const { dayId } = dropData;

    if (!recipeId || typeof recipeId !== "string" || recipeId.trim() === "") {
      console.error("Invalid recipe ID found in drag data:", dragData);
      return;
    }

    const rawTags = Array.isArray(tags) ? tags : tags ? [tags] : [primaryTag || "Entree"];
    const normalizedTags = rawTags.map((tag) => tag?.toString().trim().toLowerCase()).filter(Boolean);
    const hasComboTag = normalizedTags.includes("combo") || itemType === "combo";

    const mapTagToCategory = (tag: string) => {
      switch (tag) {
        case "entree":
        case "entrée":
        case "entrees":
          return "entrees";
        case "side":
        case "sides":
        case "vegetarian":
        case "soup":
          return "sides";
        case "fruit":
        case "fruits":
          return "fruits";
        default:
          return undefined;
      }
    };

    const explicitCategories = Array.from(
      new Set(
        normalizedTags
          .map(mapTagToCategory)
          .filter((category): category is "entrees" | "sides" | "fruits" => Boolean(category)),
      ),
    );

    const defaultComboCategories: Array<"entrees" | "sides" | "fruits"> = [
      ...(sides.length > 0 ? ["sides" as const] : []),
      ...(fruits.length > 0 ? ["fruits" as const] : []),
    ];

    const categoriesToSend: Array<"entrees" | "sides" | "fruits"> =
      explicitCategories.length > 0
        ? explicitCategories
        : hasComboTag
          ? defaultComboCategories.length > 0
            ? defaultComboCategories
            : ["entrees"]
          : ["entrees"];

    const categoryItemIds = (category: "entrees" | "sides" | "fruits"): string[] => {
      if (itemType === "combo") {
        if (category === "sides") return sides;
        if (category === "fruits") return fruits;
        return [];
      }
      return [recipeId];
    };

    try {
      const responses = await Promise.all(
        categoriesToSend.flatMap((category) =>
          categoryItemIds(category).map((itemId) =>
            fetch(`/api/calendar/${dayId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ recipeId: itemId, category }),
            }),
          ),
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
    setActiveId(null);
  }, []);
  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                <MonthView monthDates={viewDates} dateToday={today} />
                <div className="mt-2">
                  <WarningQuotaMonthly />
                </div>
              </div>
            )}

            {calendarView === "Week" && (
              <>
                <WeekView dateToday={today} weekDates={viewDates} refetchTrigger={recipeDropTrigger} />
                <WeeklyNutritionQuota dailyTotals={DUMMY_WEEKLY_NUTRITION} />
              </>
            )}

            {calendarView === "Day" && <DayView date={viewDates[0]} refetchTrigger={recipeDropTrigger} />}
          </div>
        </div>

        <div className="w-90">
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
        </div>
      </main>

      <DragOverlay>
        {activeId ? (
          <div className="rotate-3 opacity-90">
            {(() => {
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
