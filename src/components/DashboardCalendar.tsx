"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInSameWeekWeekday(selected: Date, date: Date): boolean {
  const { start, end } = getWeekRange(selected);
  const dayOfWeek = date.getDay();
  return date >= start && date <= end && dayOfWeek >= 1 && dayOfWeek <= 5;
}

export default function DashboardCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function goToPrevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function handleDateClick(day: number) {
    setSelectedDate(new Date(year, month, day));
  }

  return (
    <div className="w-full font-montserrat">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold">{monthName}</h2>
        <div className="flex gap-2">
          <button
            onClick={goToPrevMonth}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-6 w-6 text-pepper" />
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-6 w-6 text-pepper" />
          </button>
        </div>
      </div>
      {/* Day headers */}
      <div className="mb-4 grid grid-cols-7">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="text-sm font-bold">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-6">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const isSelected = selectedDate !== null && isSameDay(date, selectedDate);
          const isSameWeek = selectedDate !== null && !isSelected && isInSameWeekWeekday(selectedDate, date);
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-base transition-colors ${
                isSelected
                  ? "bg-radish-900 text-white"
                  : isSameWeek
                    ? "bg-radish-100 text-radish-900"
                    : "text-pepper hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
