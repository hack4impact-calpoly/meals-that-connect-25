"use client";
import WeekMealCard, { type WeekMealCardData } from "./WeekMealCard";

interface WeekViewProps {
  dateToday: Date;
  weekDates: Date[];
  mealsByDay?: WeekMealCardData[][];
}

export default function WeekView({ dateToday, weekDates, mealsByDay = [] }: WeekViewProps) {
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
            {(mealsByDay[idx] ?? []).length > 0 ? (
              (mealsByDay[idx] ?? []).map((meal) => <WeekMealCard key={meal.id} {...meal} />)
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-pepper/15 bg-white/55 px-3 text-center font-montserrat text-xs font-medium text-pepper/55">
                No meals planned
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
