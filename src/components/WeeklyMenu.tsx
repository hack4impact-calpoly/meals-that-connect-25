"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyMenuProps {
  dateToday: Date;
}

interface MealItem {
  name: string;
  calories: number;
  serving: string;
  tag: "Entree" | "Sides" | "Fruit" | "Combo";
}

const TAG_STYLES: Record<string, string> = {
  Combo: "bg-jicama text-radish-900",
  Sides: "bg-lime text-black",
  Fruit: "bg-fruit-900 text-white",
  Entree: "bg-entree-900 text-white",
};

// Mock meal data
const MOCK_MEALS: Record<number, MealItem[]> = {
  1: [
    { name: "Chicken Tikka Masala", calories: 225, serving: "150g", tag: "Entree" },
    { name: "Brown Rice", calories: 200, serving: "150g", tag: "Sides" },
    { name: "Corn Salad", calories: 120, serving: "100g", tag: "Sides" },
    { name: "Mango Cup", calories: 100, serving: "1 cup", tag: "Fruit" },
  ],
  2: [
    { name: "Chicken Tikka Masala", calories: 225, serving: "150g", tag: "Entree" },
    { name: "Brown Rice", calories: 200, serving: "150g", tag: "Sides" },
    { name: "Corn Salad", calories: 120, serving: "100g", tag: "Sides" },
    { name: "Mango Cup", calories: 100, serving: "1 cup", tag: "Fruit" },
  ],
  3: [
    { name: "Chicken Tikka Masala", calories: 225, serving: "150g", tag: "Entree" },
    { name: "Brown Rice", calories: 200, serving: "150g", tag: "Sides" },
  ],
  4: [{ name: "Mango Cup", calories: 100, serving: "1 cup", tag: "Fruit" }],
  5: [
    { name: "Corn Salad", calories: 120, serving: "100g", tag: "Sides" },
    { name: "Brown Rice", calories: 200, serving: "150g", tag: "Sides" },
  ],
};

const getOffsetDate = (date: Date, offset: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + offset * 7);
  return newDate;
};

const getWeekDates = (today: Date) => {
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const formatWeekRange = (weekDates: Date[]) => {
  const first = weekDates[0];
  const last = weekDates[4];
  const month = first.toLocaleDateString("en-US", { month: "short" });
  const startDay = String(first.getDate()).padStart(2, "0");
  const endDay = String(last.getDate()).padStart(2, "0");
  return `${month} ${startDay}–${endDay}`;
};

export default function WeeklyMenu({ dateToday }: WeeklyMenuProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const baseDate = getOffsetDate(dateToday, weekOffset);
  const weekDates = getWeekDates(baseDate);
  const weekRange = formatWeekRange(weekDates);

  // Determine the active day
  const todayStr = dateToday.toDateString();
  const todayIndexInWeek = weekDates.findIndex((d) => d.toDateString() === todayStr);

  const activeDayIndex = selectedDayIndex !== null ? selectedDayIndex : todayIndexInWeek !== -1 ? todayIndexInWeek : 0;
  const activeDate = weekDates[activeDayIndex];
  const activeDayOfWeek = activeDate.getDay();
  const meals = MOCK_MEALS[activeDayOfWeek] ?? [];

  const isToday = (date: Date) => date.toDateString() === todayStr;

  return (
    <div className="bg-white rounded-2xl p-6 font-montserrat flex flex-col flex-1">
      {/* Week range header */}
      <h2 className="text-2xl font-bold text-black mb-4">{weekRange}</h2>

      {/* Day navigation row */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            setWeekOffset((o) => o - 1);
            setSelectedDayIndex(null);
          }}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-1 justify-around">
          {weekDates.map((date, idx) => {
            const today = isToday(date);
            const active = idx === activeDayIndex;
            return (
              <button key={idx} onClick={() => setSelectedDayIndex(idx)} className="flex flex-col items-center gap-1">
                <span className={`text-xs font-semibold ${today || active ? "text-radish-900" : "text-pepper"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                </span>
                <span
                  className={`text-2xl font-bold leading-none ${today || active ? "text-radish-900" : "text-pepper"}`}
                >
                  {String(date.getDate()).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setWeekOffset((o) => o + 1);
            setSelectedDayIndex(null);
          }}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Meal card */}
      <div
        className={`rounded-xl border-2 p-4 flex flex-col gap-3 flex-1 ${
          isToday(activeDate) ? "border-radish-900" : "border-medium-gray"
        }`}
      >
        {meals.length === 0 ? (
          <p className="text-dark-gray text-sm text-center my-auto">No meals planned for this day.</p>
        ) : (
          meals.map((meal, idx) => {
            const style = TAG_STYLES[meal.tag] ?? "bg-pepper text-white";
            return (
              <div key={idx} className={`rounded-lg px-4 py-3 ${style}`}>
                <p className="font-bold text-sm leading-tight">{meal.name}</p>
                <p className="text-sm leading-tight font-medium mt-0.5">
                  {meal.calories} cal / {meal.serving}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
