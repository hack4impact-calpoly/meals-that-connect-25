"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/interface/recipe";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import { type WeekMealCardData } from "@/components/menuPlanning/WeekMealCard";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";

const today = new Date();
const weekViewMeals: WeekMealCardData[][] = [
  [
    {
      id: "mon-entree",
      name: "Chicken Tikka Masala",
      calories: 225,
      servingSize: "150g",
      tag: "Entree",
    },
    {
      id: "mon-side",
      name: "Brown Rice",
      calories: 200,
      servingSize: "150g",
      tag: "Sides",
    },
  ],
  [
    {
      id: "tue-pasta",
      name: "Italian Noodles",
      calories: 350,
      servingSize: "170g",
      backgroundColor: "#7b4c0a",
      textColor: "#ffffff",
    },
    {
      id: "tue-fruit",
      name: "Mango Cup",
      calories: 100,
      servingSize: "1 cup",
      tag: "Fruit",
    },
  ],
  [
    {
      id: "wed-entree",
      name: "Veggie Stir Fry",
      calories: 280,
      servingSize: "160g",
      backgroundColor: "#7b4c0a",
      textColor: "#ffffff",
    },
    {
      id: "wed-side",
      name: "Sesame Broccoli",
      calories: 110,
      servingSize: "90g",
      tag: "Sides",
    },
    {
      id: "wed-fruit",
      name: "Orange Slices",
      calories: 80,
      servingSize: "1 cup",
      tag: "Fruit",
    },
  ],
  [
    {
      id: "thu-combo",
      name: "Taco Lunch Combo",
      calories: 420,
      servingSize: "1 tray",
      tag: "Combo",
    },
    {
      id: "thu-fruit",
      name: "Pineapple Cup",
      calories: 95,
      servingSize: "1 cup",
      tag: "Fruit",
    },
  ],
  [
    {
      id: "fri-entree",
      name: "Teriyaki Chicken",
      calories: 300,
      servingSize: "155g",
      tag: "Entree",
    },
    {
      id: "fri-side",
      name: "Steamed Rice",
      calories: 190,
      servingSize: "140g",
      tag: "Sides",
    },
  ],
];

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getCurrentWeekDates(getOffsetDate(today, weekOffset));
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();
        console.log(data);
        setRecipes(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRecipes();
  }, []);

  return (
    <main className="flex flex-row">
      <div className="flex flex-1 justify-center items-center bg-gray-100">
        <div className="flex flex-col h-full pt-[8px] pl-[24px]">
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <button className="cursor-pointer" onClick={() => setWeekOffset(weekOffset - 1)}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-xl">
                {calendarView === "Week" &&
                  `${today.toLocaleDateString(undefined, { month: "short" })} ${weekDates[0].getDate()} - ${weekDates[4].getDate()}`}
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
          {calendarView === "Week" && <WeekView dateToday={today} weekDates={weekDates} mealsByDay={weekViewMeals} />}
          {calendarView === "Day" && <div className="w-275 h-full text-center">Day view coming soon!</div>}
        </div>
      </div>
      <div className="w-103.25">
        <RecipeDatabase recipes={recipes} />
      </div>
    </main>
  );
}
