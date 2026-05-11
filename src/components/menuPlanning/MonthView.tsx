"use client";

import WarningQuotaMonthly from "@/components/WarningQuotaMonthly";
import { NutritionSummary } from "@/lib/nutrition";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THUR", "FRI", "SAT"] as const;

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

type Props = {
  /** In-month dates only (1..last day). */
  monthDates: Date[];
  dateToday: Date;
  nutritionByDate?: Record<string, NutritionSummary>;
};

function formatDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export default function MonthView({ monthDates, dateToday, nutritionByDate = {} }: Props) {
  const focusDate = monthDates[0] ?? new Date();
  const leadingBlanks = focusDate.getDay(); // Sunday-first
  const cells: Array<Date | null> = [...Array.from({ length: leadingBlanks }, () => null), ...monthDates];
  const weeks: Array<Array<Date | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="mt-4 flex min-h-0 w-full flex-1 flex-col gap-2">
      <div className="grid shrink-0 grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center font-montserrat text-xs font-medium uppercase text-dark-gray">
            {label}
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid min-h-0 flex-1 grid-cols-7 gap-2">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`${wi}-${di}`} className="min-h-[90px]" aria-hidden />;
              }
              const weekend = isWeekend(date);
              const isToday = date.toDateString() === dateToday.toDateString();
              const inMonth = isSameMonth(date, focusDate);
              const nutritionSummary = nutritionByDate[formatDayId(date)];
              const showWarning = !weekend && nutritionSummary && !nutritionSummary.quotaMet;

              return (
                <div
                  key={`${wi}-${di}`}
                  className={`relative min-h-[90px] overflow-hidden rounded-[12px] border border-medium-gray ${
                    weekend ? "bg-medium-gray/35" : "bg-white"
                  } ${isToday ? "ring-2 ring-radish-900" : ""} ${inMonth ? "" : "opacity-60"}`}
                  data-drop-disabled={weekend ? "true" : undefined}
                  aria-disabled={weekend}
                  title={weekend ? "Weekends — meals cannot be placed here" : undefined}
                >
                  {showWarning ? (
                    <div className="absolute left-2 top-2">
                      <WarningQuotaMonthly />
                    </div>
                  ) : null}
                  <span className="absolute right-2 top-2 font-montserrat text-sm font-normal text-dark-gray">
                    {String(date.getDate()).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
