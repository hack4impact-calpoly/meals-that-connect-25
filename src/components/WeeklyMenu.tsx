"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_TO_BUCKET, Nutrition, RecipeBucket, RecipeCategory, TAG_STYLES } from "@/lib/types";

interface WeeklyMenuProps {
  dateToday: Date;
}

interface MealItem {
  _id: string;
  name: string;
  nutritional_info: Nutrition;
  serving: string;

  // TODO: when this is wired to the backend, this should come from Recipe.category.
  category: RecipeCategory;

  // TODO: when this is wired to the backend, this should come from the Calendar bucket
  // the recipe was stored under: entrees, vegetables, fruits, or grains.
  calendarBucket: RecipeBucket;
}

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
  const startMonth = first.toLocaleDateString("en-US", { month: "short" });
  const endMonth = last.toLocaleDateString("en-US", { month: "short" });
  const startDay = String(first.getDate());
  const endDay = String(last.getDate());
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
};

const fetchCalendarById = async (id: string) => {
  const res = await fetch(`/api/calendar/${id}`);
  if (!res.ok) throw new Error("Failed to fetch calendar");
  return await res.json();
};

export default function WeeklyMenu({ dateToday }: WeeklyMenuProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const baseDate = getOffsetDate(dateToday, weekOffset);
  const weekDates = getWeekDates(baseDate);
  const weekRange = formatWeekRange(weekDates);

  const todayStr = dateToday.toDateString();
  const todayIndexInWeek = weekDates.findIndex((d) => d.toDateString() === todayStr);

  const activeDayIndex = selectedDayIndex !== null ? selectedDayIndex : todayIndexInWeek !== -1 ? todayIndexInWeek : 0;
  const activeDate = weekDates[activeDayIndex];
  const activeDayOfWeek = activeDate.getDay();
  const [meals, setMeals] = useState<MealItem[]>([]);

  const isToday = (date: Date) => date.toDateString() === todayStr;

  useEffect(() => {
    const calendarId = activeDate.toISOString().slice(0, 10).replace(/-/g, "");
    const getCalendar = async () => {
      try {
        const data = await fetchCalendarById(calendarId);
        console.log([...data.entrees, ...data.vegetables, ...data.fruits, ...data.grains]);
        setMeals([...data.entrees, ...data.vegetables, ...data.fruits, ...data.grains]);
      } catch (err) {
        setMeals([]);
      }
    };
    getCalendar();
  }, [weekOffset, selectedDayIndex, dateToday]);

  return (
    <div className="flex flex-1 flex-col rounded-2xl bg-white p-6 font-montserrat">
      <h2 className="mb-4 text-2xl font-bold text-black">{weekRange}</h2>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => {
            setWeekOffset((o) => o - 1);
            setSelectedDayIndex(null);
          }}
          className="rounded-full p-1 transition-colors hover:bg-gray-100"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        <div className="flex flex-1 justify-around">
          {weekDates.map((date, idx) => {
            const today = isToday(date);
            const active = idx === activeDayIndex;

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDayIndex(idx)}
                className="flex flex-col items-center gap-1"
              >
                <span className={`text-xs font-semibold ${today || active ? "text-radish-900" : "text-pepper"}`}>
                  {date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                </span>
                <span
                  className={`text-2xl leading-none font-bold ${today || active ? "text-radish-900" : "text-pepper"}`}
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
          className="rounded-full p-1 transition-colors hover:bg-gray-100"
          aria-label="Next week"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div
        className={`flex flex-1 flex-col gap-3 rounded-xl border-2 p-4 ${
          isToday(activeDate) ? "border-radish-900" : "border-medium-gray"
        }`}
      >
        {meals.length === 0 ? (
          <p className="my-auto text-center text-sm text-dark-gray">No meals planned for this day.</p>
        ) : (
          meals.map((meal) => {
            const style = TAG_STYLES[meal.category];

            return (
              <div key={meal._id} className={`rounded-lg px-4 py-3 ${style}`}>
                <p className="text-sm leading-tight font-bold">{meal.name}</p>
                <p className="mt-0.5 text-sm leading-tight font-medium">
                  {meal.nutritional_info.calories} cal / {meal.serving} servings
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
