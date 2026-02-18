"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/interface/recipe";
import WeekView from "@/components/menuPlanning/WeekView";
import Navbar from "@/components/Navbar";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";

const today = new Date();

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
    <main className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row grow">
        <div className="flex flex-1 justify-center items-center bg-gray-100">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mt-4 flex-none">
              <div>
                <button className="cursor-pointer" onClick={() => setWeekOffset(weekOffset - 1)}>
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <button className="cursor-pointer" onClick={() => setWeekOffset(weekOffset + 1)}>
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-row">
                <div className="flex bg-white rounded-md w-fit">
                  <button className="cursor-pointer px-3 py-1 rounded-md font-semibold text-black transition-colors duration-200">
                    Month
                  </button>
                  <button className="cursor-pointer px-3 py-1 rounded-md font-semibold bg-radish-900 text-white">
                    Week
                  </button>
                  <button className="cursor-pointer px-3 py-1 rounded-md font-semibold text-black transition-colors duration-200">
                    Day
                  </button>
                </div>
                <span className="bg-radish-900 rounded-md p-2 ml-2">
                  <ArrowDownToLine className="cursor-pointer" color="white" size={20} strokeWidth={2.5} />
                </span>
              </div>
            </div>
            <WeekView dateToday={today} weekDates={weekDates} />
          </div>
        </div>
        <div className="w-[413px]">
          <RecipeDatabase recipes={recipes} />
        </div>
      </div>
    </main>
  );
}
