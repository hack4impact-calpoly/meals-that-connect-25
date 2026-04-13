"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { Recipe } from "@/interface/recipe";
import { Combo } from "@/lib/types";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import DraggableRecipeCard from "@/components/menuPlanning/DraggableRecipeCard";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";

const today = new Date();

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

const getOffsetDate = (date: Date, offset: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + offset * 7);
  return newDate;
};

const getCurrentWeekDates = (today: Date) => {
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // start from Monday

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export default function MenuPlanning() {
  const [recipes, setRecipes] = useState<CalendarItem[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [recipeDropTrigger, setRecipeDropTrigger] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const weekDates = getCurrentWeekDates(getOffsetDate(today, weekOffset));
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");

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
          tags: recipe.tags ?? ["Entree"],
        }));

        const comboItems: CalendarItem[] = (combosJson.data ?? []).map((combo: Combo) => ({
          ...combo,
          itemType: "combo",
          tags: ["Combo", ...(combo.sides?.length ? ["Side"] : []), ...(combo.fruits?.length ? ["Fruit"] : [])],
          sides: combo.sides?.map((side) => side.name) ?? [],
          fruits: combo.fruits?.map((fruit) => fruit.name) ?? [],
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
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <main className="flex flex-row">
          <div className="flex flex-1 justify-center items-center bg-gray-100">
            <div className="flex flex-col h-full pt-[8px] pl-[24px] w-full">
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="cursor-pointer" onClick={() => setWeekOffset(weekOffset - 1)}>
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <span className="font-bold text-xl">
                    {calendarView === "Week" &&
                      `${today.toLocaleDateString(undefined, { month: "short" })} ${String(weekDates[0].getDate()).padStart(2, "0")} - ${String(weekDates[4].getDate()).padStart(2, "0")}`}
                  </span>
                  <button className="cursor-pointer" onClick={() => setWeekOffset(weekOffset + 1)}>
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
                    <ArrowDownToLine className="cursor-pointer" color="white" size={20} strokeWidth={2.5} />
                  </span>
                </div>
              </div>
              {calendarView === "Month" && <div className="w-275 h-full text-center">Month view coming soon!</div>}
              {calendarView === "Week" && (
                <WeekView dateToday={today} weekDates={weekDates} refetchTrigger={recipeDropTrigger} />
              )}
              {calendarView === "Day" && <div className="w-275 h-full text-center">Day view coming soon!</div>}
            </div>
          </div>
          <div className="w-103.25">
            <RecipeDatabase recipes={recipes} />
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
    </>
  );
}
