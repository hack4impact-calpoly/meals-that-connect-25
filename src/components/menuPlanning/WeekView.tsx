"use client";
import { useEffect, useState } from "react";
import WeekMealCard, { type WeekMealCardData } from "./WeekMealCard";
import NutritionInfoNotMetCard from "./NutritionInfoNotMetCard";
import DroppableCalendarArea from "./DroppableCalendarArea";

interface WeekViewProps {
  dateToday: Date;
  weekDates: Date[];
  refetchTrigger?: number;
}

type WeekViewDayData = {
  meals: WeekMealCardData[];
  showNutritionInfoNotMet?: boolean;
};

type CalendarRecipe = {
  _id: string;
  name: string;
  serving?: number;
};

type CalendarDayResponse = {
  _id: string;
  entrees?: CalendarRecipe[];
  fruits?: CalendarRecipe[];
  sides?: CalendarRecipe[];
};

const formatCalendarDayId = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const mapCalendarRecipesToMeals = (recipes: CalendarRecipe[] | undefined, tag: WeekMealCardData["tag"]) =>
  (recipes ?? []).map((recipe) => ({
    id: recipe._id,
    name: recipe.name,
    servingSize: recipe.serving != null ? `${recipe.serving} servings` : undefined,
    tag,
  }));

export default function WeekView({ dateToday, weekDates, refetchTrigger }: WeekViewProps) {
  const [weekViewMeals, setWeekViewMeals] = useState<WeekViewDayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchWeekMeals() {
    setIsLoading(true);

    try {
      const weekMeals = await Promise.all(
        weekDates.map(async (date) => {
          const response = await fetch(`/api/calendar/${formatCalendarDayId(date)}`);

          if (response.status === 404) {
            return { meals: [], showNutritionInfoNotMet: true };
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch calendar day ${formatCalendarDayId(date)}`);
          }

          const calendarDay: CalendarDayResponse = await response.json();

          return {
            meals: [
              ...mapCalendarRecipesToMeals(calendarDay.entrees, "Entree"),
              ...mapCalendarRecipesToMeals(calendarDay.sides, "Sides"),
              ...mapCalendarRecipesToMeals(calendarDay.fruits, "Fruit"),
            ],
            showNutritionInfoNotMet: false,
          };
        }),
      );

      setWeekViewMeals(weekMeals);
    } catch (error) {
      console.error("Error fetching week meals:", error);
      setWeekViewMeals(weekDates.map(() => ({ meals: [], showNutritionInfoNotMet: false })));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function fetch() {
      if (isMounted) {
        await fetchWeekMeals();
      }
    }

    fetch();

    return () => {
      isMounted = false;
    };
  }, [weekDates, refetchTrigger]);

  return (
    <div className="relative my-4 grid flex-1 grid-cols-5 gap-3">
      {weekDates.map((date, idx) => (
        <div key={idx} className="flex min-w-0 flex-col items-center">
          <span className="text-xs font-montserrat font-medium tracking-[0.12em] text-pepper">
            {date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
          </span>
          <span
            className={`mb-2 text-2xl font-montserrat font-bold ${
              date.toDateString() === dateToday.toDateString() ? "text-radish-900" : "text-pepper"
            }`}
          >
            {String(date.getDate()).padStart(2, "0")}
          </span>
          <div
            className={`flex min-h-[420px] w-full flex-1 flex-col gap-3 rounded-[14px] p-3 ${
              date.toDateString() === dateToday.toDateString()
                ? "border-2 border-radish-900"
                : "border border-medium-gray/35"
            } bg-white`}
          >
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 text-center font-montserrat text-xs font-medium text-pepper/55">
                Loading meals...
              </div>
            ) : (weekViewMeals[idx]?.meals ?? []).length > 0 ? (
              <DroppableCalendarArea dayId={formatCalendarDayId(date)}>
                {weekViewMeals[idx]?.meals?.map((meal) => <WeekMealCard key={meal.id} {...meal} />) || null}
              </DroppableCalendarArea>
            ) : (
              <DroppableCalendarArea dayId={formatCalendarDayId(date)}>
                <div className="flex flex-1 items-center justify-center text-center font-montserrat text-xs font-medium text-pepper/55">
                  Drop recipe here
                </div>
              </DroppableCalendarArea>
            )}

            {weekViewMeals[idx]?.showNutritionInfoNotMet ? <NutritionInfoNotMetCard /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
