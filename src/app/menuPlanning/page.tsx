"use client";

import { useState } from "react";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import CurrentDateButton from "@/components/CurrentDateButton";
import RecipeDailyCard from "@/components/RecipeDailyCard";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";
import { CategoryValue, EMPTY_FILTERS, SortOption } from "@/lib/types";
import { useMealData } from "@/hooks/useMealData";
import { first } from "firebase/firestore/pipelines";

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

const getOffsetMonthDate = (date: Date, offset: number) => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + offset);
  return newDate;
};

const getOffsetDayDate = (date: Date, offset: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + offset);
  return newDate;
};

export default function MenuPlanning() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdDate");
  const [dayOffset, setDayOffset] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const monthDate = getOffsetMonthDate(today, monthOffset);
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  const weekDates = getCurrentWeekDates(getOffsetDate(today, weekOffset));

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

  const { items, loading, error } = useMealData({
    search,
    filters: EMPTY_FILTERS,
    selectedCategories,
    draftMode: false,
    sortBy,
  });

  const handleNavigate = (direction: "prev" | "next") => {
    if (calendarView === "Week") {
      setWeekOffset((prev) => prev + (direction === "prev" ? -1 : 1));
    } else if (calendarView === "Month") {
      setMonthOffset((prev) => prev + (direction === "prev" ? -1 : 1));
    } else if (calendarView === "Day") {
      setDayOffset((prev) => prev + (direction === "prev" ? -1 : 1));
    }
  };

  const handleReset = () => {
    setWeekOffset(0);
    setMonthOffset(0);
    setDayOffset(0);
  };

  return (
    <main className="flex flex-row">
      <div className="flex flex-1 justify-center items-center bg-gray-100">
        <div className="flex flex-col h-full w-210">
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <CurrentDateButton onClick={() => handleReset()} />
              <button className="cursor-pointer" onClick={() => handleNavigate("prev")}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-xl">
                {(calendarView === "Week" &&
                  (() => {
                    const firstDay = weekDates[0];
                    const lastDay = weekDates[4];

                    const startMonth = firstDay.toLocaleDateString(undefined, { month: "short" });
                    const endMonth = lastDay.toLocaleDateString(undefined, { month: "short" });

                    if (startMonth !== endMonth) {
                      return `${startMonth} ${firstDay.getDate()} - ${endMonth} ${lastDay.getDate()}`;
                    }
                    return `${startMonth} ${firstDay.getDate()} - ${lastDay.getDate()}`;
                  })()) ||
                  (calendarView === "Month" &&
                    (() => {
                      const month = monthDate.toLocaleDateString(undefined, { month: "short" });
                      const year = monthDate.getFullYear();
                      return `${month} ${year}`;
                    })()) ||
                  (calendarView === "Day" &&
                    (() => {
                      const currentDay = getOffsetDayDate(today, dayOffset);
                      const dayOfWeek = currentDay.toLocaleDateString(undefined, { weekday: "long" });
                      const day = currentDay.getDate();
                      const month = currentDay.toLocaleDateString(undefined, { month: "long" });
                      const year = currentDay.getFullYear();
                      return `${dayOfWeek}, ${month} ${day}, ${year}`;
                    })())}
              </span>
              <button className="cursor-pointer" onClick={() => handleNavigate("next")}>
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
          {calendarView === "Day" && (
            // dummy data
            <div>
              <RecipeDailyCard name="Chicken Tikka Masala" calories={225} servingSize="150g" tags={["Entree"]} />
              <RecipeDailyCard name="Mango Fruit Cup" calories={100} servingSize="100g" tags={["Fruit"]} />
            </div>
          )}
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
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>
    </main>
  );
}
