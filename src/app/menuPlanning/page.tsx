"use client";

import { useEffect, useState } from "react";
import WeekView from "@/components/menuPlanning/WeekView";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";
import CurrentDateButton from "@/components/CurrentDateButton";
import RecipeDailyCard from "@/components/RecipeDailyCard";
import RecipeMonthlyCard from "@/components/RecipeMonthlyCard";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";
import { CategoryValue, EMPTY_FILTERS, Recipe, SortOption } from "@/lib/types";
import { useMealData } from "@/hooks/useMealData";
import { first } from "firebase/firestore/pipelines";
import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";
import { Label } from "@headlessui/react";

interface CalendarDay {
  _id: string;
  entrees: Recipe[];
  fruits: Recipe[];
  sides: Recipe[];
}

const today = new Date();
const SAMPLE_RECIPES: Recipe[] = [
  {
    item: null,
    _id: "oo",
    name: "Chicken Tikka Masala",
    serving: 150,
    filters: ["Entree"],
    isDraft: false,
    nutritional_info: { calories: 225, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
  {
    item: null,
    _id: "sample-mango-cup",
    name: "Mango Cup",
    serving: 100,
    filters: ["Fruit"],
    isDraft: false,
    nutritional_info: { calories: 100, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
  {
    item: null,
    _id: "sample-brown-rice",
    name: "Brown Rice",
    serving: 150,
    filters: ["Sides"],
    isDraft: false,
    nutritional_info: { calories: 200, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  },
];

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
      return date;
    });
  }
  return [];
};

export default function MenuPlanning() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdDate");
  const [calendarView, setCalendarView] = useState<"Month" | "Week" | "Day">("Week");
  const [datesOffset, setDatesOffset] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());
  const viewDates = getCurrentViewDates(getOffsetDate(today, datesOffset, calendarView), calendarView); // Day: 1 day, Week: 5 days, Month: 35 days (including prev/next month)

  const downloadMonthlyMenu = async () => {
    let currentMonth: number;
    let currentYear: number;
    if (calendarView === "Day") {
      currentMonth = viewDates[0].getMonth();
      currentYear = viewDates[0].getFullYear();
    } else if (calendarView === "Week") {
      currentMonth = viewDates[0].getMonth();
      currentYear = viewDates[0].getFullYear();
    } else {
      currentMonth = viewDates[10].getMonth();
      currentYear = viewDates[10].getFullYear();
    }

    try {
      const res = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth + 1}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const dates = await res.json();

      const data: IContent[] = [];

      dates.forEach((date: CalendarDay) => {
        const formattedDate = `${date._id.slice(0, 4)}-${date._id.slice(4, 6)}-${date._id.slice(6, 8)}`;
        const allItems = [...(date.entrees || []), ...(date.fruits || []), ...(date.sides || [])];

        // Calculate totals
        const totals = allItems.reduce(
          (acc, item) => {
            acc.calorie += item.nutritional_info.calories || 0;
            acc.protein += item.nutritional_info.protein || 0;
            acc.fat += item.nutritional_info.fat || 0;
            acc.carbs += item.nutritional_info.carbs || 0;
            acc.fiber += item.nutritional_info.fiber || 0;
            acc.sodium += item.nutritional_info.sodium || 0;
            return acc;
          },
          {
            name: formattedDate,
            serving: "",
            calorie: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            fiber: 0,
            sodium: 0,
          },
        );
        data.push(totals);

        // Push individual items
        const pushItems = (items: Recipe[], type: string) => {
          items?.forEach((item) => {
            data.push({
              name: item.name,
              serving: item.serving,
              calorie: item.nutritional_info.calories,
              protein: item.nutritional_info.protein,
              fat: item.nutritional_info.fat,
              carbs: item.nutritional_info.carbs,
              fiber: item.nutritional_info.fiber,
              sodium: item.nutritional_info.sodium,
            });
          });
        };
        pushItems(date.entrees, "Entree");
        pushItems(date.fruits, "Fruit");
        pushItems(date.sides, "Side");

        // spacing
        data.push({
          name: "",
          serving: "",
          calorie: "",
          protein: "",
          fat: "",
          carbs: "",
          fiber: "",
          sodium: "",
        });
      });

      const sheetData: IJsonSheet[] = [
        {
          sheet: "Menu",
          columns: [
            { label: "Item Name", value: "name" },
            { label: "Serving", value: "serving" },
            { label: "Cals (kcal)", value: "calorie" },
            { label: "Prot (g)", value: "protein" },
            { label: "Fat (g)", value: "fat" },
            { label: "Carbs (g)", value: "carbs" },
            { label: "Fiber (g)", value: "fiber" },
            { label: "Sodium (mg)", value: "sodium" },
          ],
          content: data,
        },
      ];

      const settings = { fileName: `${currentYear}_${(currentMonth + 1).toString().padStart(2, "0")}_MTC_Menu.xlsx` };
      xlsx(sheetData, settings);
    } catch (error) {
      console.error("Error downloading monthly menu:", error);
    }
  };

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

  useEffect(() => {
    setDatesOffset(0);
  }, [calendarView]);

  return (
    <main className="flex flex-row">
      <div className="flex flex-1 justify-center items-center bg-gray-100">
        <div className="flex flex-col h-full w-210">
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <CurrentDateButton onClick={() => setDatesOffset(0)} />
              <button className="cursor-pointer" onClick={() => setDatesOffset(datesOffset - 1)}>
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-xl">
                {calendarView === "Day" &&
                  `${viewDates[0].toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
                {calendarView === "Week" &&
                  `${viewDates[0].toLocaleDateString(undefined, { month: "long" })} ${viewDates[0].getDate()} - ${viewDates[4].toLocaleDateString(undefined, { month: "long" })} ${viewDates[4].getDate()}`}
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
                <ArrowDownToLine
                  className="cursor-pointer"
                  color="white"
                  size={20}
                  strokeWidth={2.5}
                  onClick={downloadMonthlyMenu}
                />
              </span>
            </div>
          </div>

          {calendarView === "Month" && (
            // dummy data
            <div className="space-y-2">
              <div>Month view coming soon!</div>
              <div className="w-40">
                <RecipeMonthlyCard item={SAMPLE_RECIPES[0]} name="Chicken Tikka Masala" tags={["Entree"]} />
              </div>
              <div className="w-40">
                <RecipeMonthlyCard item={SAMPLE_RECIPES[1]} name="Mango Cup" tags={["Fruit"]} />
              </div>
              <div className="w-40">
                <RecipeMonthlyCard item={SAMPLE_RECIPES[2]} name="Brown Rice" tags={["Sides"]} />
              </div>
              <WarningQuotaMonthly />
            </div>
          )}
          {calendarView === "Week" && <WeekView dateToday={today} weekDates={viewDates} />}
          {calendarView === "Day" && (
            // dummy data
            <div>
              <RecipeDailyCard
                item={SAMPLE_RECIPES[0]}
                name="Chicken Tikka Masala"
                calories={225}
                servingSize="150g"
                tags={["Entree"]}
              />
              <RecipeDailyCard
                item={SAMPLE_RECIPES[1]}
                name="Mango Fruit Cup"
                calories={100}
                servingSize="100g"
                tags={["Fruit"]}
              />
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
