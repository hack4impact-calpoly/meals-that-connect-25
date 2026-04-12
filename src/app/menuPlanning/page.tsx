"use client";

import { useState } from "react";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";
import { CategoryValue, EMPTY_FILTERS } from "@/lib/types";
import { useMealData } from "@/hooks/useMealData";

const today = new Date();

const getOffsetDate = (date: Date, offset: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + offset * 7);
  return newDate;
};

const getCurrentWeekDates = (today: Date) => {
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export default function MenuPlanning() {
  const [search, setSearch] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  const weekDates = getCurrentWeekDates(getOffsetDate(today, weekOffset));

  const toggleCategory = (category: CategoryValue) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);

      if (category === "combo") {
        if (next.has("combo")) return new Set<CategoryValue>();
        return new Set<CategoryValue>(["combo"]);
      }

      if (next.has("combo")) next.delete("combo");

      if (next.has(category)) next.delete(category);
      else next.add(category);

      return next;
    });
  };

  const { items, loading, error } = useMealData({
    search,
    filters: EMPTY_FILTERS,
    selectedCategories,
    draftMode: false,
  });

  return (
    <main className="flex flex-row">
      <div className="flex flex-1 justify-center items-center bg-gray-100">
        <div className="flex flex-col h-full w-210">
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

          {calendarView === "Month" && <div>Month view coming soon!</div>}
          {calendarView === "Week" && <WeekView dateToday={today} weekDates={weekDates} />}
          {calendarView === "Day" && <div>Day view coming soon!</div>}
        </div>
      </div>

      <div className="w-103.25">
        <RecipeDatabase
          items={items}
          loading={loading}
          error={error}
          onSearch={setSearch}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
        />
      </div>
    </main>
  );
}
