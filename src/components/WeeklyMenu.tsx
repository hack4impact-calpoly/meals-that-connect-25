"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyMenuProps {
  dateToday: Date;
}

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

export default function WeeklyMenu({ dateToday }: WeeklyMenuProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = getCurrentWeekDates(getOffsetDate(dateToday, weekOffset));

  return (
    <div className="px-[10px] w-[833px] h-[317px] rounded-2xl border border-black">
      <div className="relative mt-4 flex justify-between gap-3">
        <button className="absolute left-3 top-3 cursor-pointer" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {weekDates.map((date, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-xs font-montserrat font-medium">
              {date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase()}
            </span>
            <span
              className={`text-2xl font-montserrat font-bold mb-2 ${
                date.toDateString() === dateToday.toDateString() ? "text-radish-900" : ""
              }`}
            >
              {String(date.getDate()).padStart(2, "0")}
            </span>
            <div
              className={`flex flex-col items-center w-full h-[219px] rounded-[10px] p-2 ${
                date.toDateString() === dateToday.toDateString() ? "border-2 border-radish-900" : ""
              }`}
            >
              <div className="w-[129px] h-[56px] bg-green-500 rounded-md m-1"></div>
              <div className="w-[129px] h-[56px] bg-orange-500 rounded-md m-1"></div>
            </div>
          </div>
        ))}

        <button className="absolute right-3 top-3 cursor-pointer" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
