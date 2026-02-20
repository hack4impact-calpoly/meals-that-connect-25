"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";

interface WeekViewProps {
  dateToday: Date;
  weekDates: Date[];
}

export default function WeekView({ dateToday, weekDates }: WeekViewProps) {
  return (
    <div className="relative my-4 flex justify-between gap-3 flex-1">
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
            className={`flex flex-col items-center w-full h-full rounded-[10px] p-2 bg-white ${
              date.toDateString() === dateToday.toDateString() ? "border-2 border-radish-900" : ""
            }`}
          >
            <div className="w-[129px] h-[56px] bg-green-500 rounded-md m-1"></div>
            <div className="w-[129px] h-[56px] bg-orange-500 rounded-md m-1"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
