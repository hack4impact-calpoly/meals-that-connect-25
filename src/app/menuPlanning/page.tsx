"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/interface/recipe";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";

const today = new Date();

const getOffsetDate = (date: Date, offset: number, view: "Month" | "Week" | "Day") => {
  const newDate = new Date(date);
  if (view === "Day") {
    newDate.setDate(date.getDate() + offset);
  } else if (view === "Week") {
    newDate.setDate(date.getDate() + offset * 7);
  } else if (view === "Month") {
    newDate.setMonth(date.getMonth() + offset);
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
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let startDay: Date;
    startDay = new Date(startOfMonth);

    if (startDay.getDay() !== 0) {
      const prevMonthStartDay =
        new Date(today.getFullYear(), today.getMonth(), 0).getDate() - startOfMonth.getDay() + 1;
      const prevMonth = today.getMonth() - 1;
      const prevMonthYear = prevMonth < 0 ? today.getFullYear() - 1 : today.getFullYear();
      const prevMonthDate = new Date(prevMonthYear, (prevMonth + 12) % 12, prevMonthStartDay);
      startDay = new Date(prevMonthDate);
    }

    return Array.from({ length: 35 }, (_, i) => {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + i);
      console.log(date);
      return date;
    });
  }
  return [];
};

export default function MenuPlanning() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);

  const viewDates = getCurrentViewDates(getOffsetDate(today, datesOffset, calendarView), calendarView);

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
        <div className="flex flex-col h-full w-210">
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset - 1)}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-xl">
                {calendarView === "Day" &&
                  `${viewDates[0].toLocaleDateString(undefined, { month: "short" })} ${viewDates[0].getDate()}`}
                {calendarView === "Week" &&
                  `${viewDates[0].toLocaleDateString(undefined, { month: "short" })} ${viewDates[0].getDate()} - ${viewDates[4].getDate()}`}
                {/* use 10th date instead of 0 to guarantee a date in the current month */}
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
                <ArrowDownToLine className="cursor-pointer" color="white" size={20} strokeWidth={2.5} />
              </span>
            </div>
          </div>
          {calendarView === "Month" && <div>Month view coming soon!</div>}
          {calendarView === "Week" && <WeekView dateToday={today} weekDates={viewDates} />}
          {calendarView === "Day" && <div>Day view coming soon!</div>}
        </div>
      </div>
      <div className="w-103.25">
        <RecipeDatabase recipes={recipes} />
      </div>
    </main>
  );
}
