"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORY_TO_BUCKET, RecipeBucket, RecipeCategory, TAG_STYLES } from "@/lib/types";

interface WeeklyMenuProps {
  dateToday: Date;
}

interface MealItem {
  _id: string;
  name: string;
  calories: number;
  servingSize: string;

  // TODO: when this is wired to the backend, this should come from Recipe.category.
  category: RecipeCategory;

  // TODO: when this is wired to the backend, this should come from the Calendar bucket
  // the recipe was stored under: entrees, vegetables, fruits, or grains.
  calendarBucket: RecipeBucket;
}

// Mock meal data
// TODO: replace this with calendar data from /api/calendar?year=YYYY&month=MM.
// Calendar days should store recipe IDs grouped by bucket:
// entrees, vegetables, fruits, grains.
const MOCK_MEALS: Record<number, MealItem[]> = {
  1: [
    {
      _id: "entree-chicken-teriyaki-bowl",
      name: "Chicken Teriyaki Bowl",
      calories: 320,
      servingSize: "4 servings",
      category: "Entree",
      calendarBucket: CATEGORY_TO_BUCKET.Entree,
    },
    {
      _id: "grain-brown-rice",
      name: "Brown Rice",
      calories: 220,
      servingSize: "6 servings",
      category: "Grain",
      calendarBucket: CATEGORY_TO_BUCKET.Grain,
    },
    {
      _id: "vegetable-roasted-broccoli",
      name: "Roasted Broccoli",
      calories: 120,
      servingSize: "4 servings",
      category: "Vegetable",
      calendarBucket: CATEGORY_TO_BUCKET.Vegetable,
    },
    {
      _id: "fruit-citrus-orange-wedges",
      name: "Citrus Orange Wedges",
      calories: 90,
      servingSize: "4 servings",
      category: "Fruit",
      calendarBucket: CATEGORY_TO_BUCKET.Fruit,
    },
  ],
  2: [
    {
      _id: "entree-turkey-taco-meat",
      name: "Turkey Taco Meat",
      calories: 260,
      servingSize: "5 servings",
      category: "Entree",
      calendarBucket: CATEGORY_TO_BUCKET.Entree,
    },
    {
      _id: "grain-corn-tortillas",
      name: "Corn Tortillas",
      calories: 140,
      servingSize: "6 servings",
      category: "Grain",
      calendarBucket: CATEGORY_TO_BUCKET.Grain,
    },
    {
      _id: "vegetable-corn-and-pepper-saute",
      name: "Corn and Pepper Sauté",
      calories: 140,
      servingSize: "5 servings",
      category: "Vegetable",
      calendarBucket: CATEGORY_TO_BUCKET.Vegetable,
    },
    {
      _id: "fruit-watermelon-cups",
      name: "Watermelon Cups",
      calories: 70,
      servingSize: "6 servings",
      category: "Fruit",
      calendarBucket: CATEGORY_TO_BUCKET.Fruit,
    },
  ],
  3: [
    {
      _id: "entree-beef-and-bean-chili",
      name: "Beef and Bean Chili",
      calories: 410,
      servingSize: "6 servings",
      category: "Entree",
      calendarBucket: CATEGORY_TO_BUCKET.Entree,
    },
    {
      _id: "grain-brown-rice",
      name: "Brown Rice",
      calories: 220,
      servingSize: "6 servings",
      category: "Grain",
      calendarBucket: CATEGORY_TO_BUCKET.Grain,
    },
    {
      _id: "fruit-cinnamon-apples",
      name: "Cinnamon Apples",
      calories: 130,
      servingSize: "4 servings",
      category: "Fruit",
      calendarBucket: CATEGORY_TO_BUCKET.Fruit,
    },
  ],
  4: [
    {
      _id: "entree-lemon-herb-salmon",
      name: "Lemon Herb Salmon",
      calories: 360,
      servingSize: "4 servings",
      category: "Entree",
      calendarBucket: CATEGORY_TO_BUCKET.Entree,
    },
    {
      _id: "vegetable-garlic-green-beans",
      name: "Garlic Green Beans",
      calories: 90,
      servingSize: "4 servings",
      category: "Vegetable",
      calendarBucket: CATEGORY_TO_BUCKET.Vegetable,
    },
    {
      _id: "grain-quinoa-pilaf",
      name: "Quinoa Pilaf",
      calories: 240,
      servingSize: "5 servings",
      category: "Grain",
      calendarBucket: CATEGORY_TO_BUCKET.Grain,
    },
  ],
  5: [
    {
      _id: "entree-baked-chicken-meatballs",
      name: "Baked Chicken Meatballs",
      calories: 310,
      servingSize: "5 servings",
      category: "Entree",
      calendarBucket: CATEGORY_TO_BUCKET.Entree,
    },
    {
      _id: "vegetable-honey-glazed-carrots",
      name: "Honey Glazed Carrots",
      calories: 150,
      servingSize: "4 servings",
      category: "Vegetable",
      calendarBucket: CATEGORY_TO_BUCKET.Vegetable,
    },
    {
      _id: "grain-whole-wheat-pasta",
      name: "Whole Wheat Pasta",
      calories: 250,
      servingSize: "6 servings",
      category: "Grain",
      calendarBucket: CATEGORY_TO_BUCKET.Grain,
    },
    {
      _id: "fruit-berry-yogurt-cup",
      name: "Berry Yogurt Cup",
      calories: 180,
      servingSize: "4 servings",
      category: "Fruit",
      calendarBucket: CATEGORY_TO_BUCKET.Fruit,
    },
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

  const todayStr = dateToday.toDateString();
  const todayIndexInWeek = weekDates.findIndex((d) => d.toDateString() === todayStr);

  const activeDayIndex = selectedDayIndex !== null ? selectedDayIndex : todayIndexInWeek !== -1 ? todayIndexInWeek : 0;
  const activeDate = weekDates[activeDayIndex];
  const activeDayOfWeek = activeDate.getDay();
  const meals = MOCK_MEALS[activeDayOfWeek] ?? [];

  const isToday = (date: Date) => date.toDateString() === todayStr;

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
                  {meal.calories} cal / {meal.servingSize}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
