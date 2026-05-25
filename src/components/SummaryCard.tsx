"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { MONTHS } from "@/lib/types";
import type { NutritionSummary } from "@/lib/nutrition";

interface DonutChartProps {
  value: number;
  total: number;
}

function DonutChart({ value, total }: DonutChartProps) {
  const size = 165;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(value / total, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background ring */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f7daeb" strokeWidth={strokeWidth} />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d8489a"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-black leading-none">{value}</span>
        <span className="text-xl text-pepper font-medium">/ {total}</span>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value?: number;
  total?: number;
  labelSuffix: string;
  metric?: "mealsPlanned" | "nutritionMet";
}

type CalendarSummaryDay = {
  _id: string;
  entrees?: unknown[];
};

type SummaryCounts = {
  value: number;
  total: number;
};

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

async function getCalendarDays(year: number, monthIndex: number, signal: AbortSignal) {
  const response = await fetch(`/api/calendar?year=${year}&month=${monthIndex + 1}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard calendar summary (${response.status})`);
  }

  return (await response.json()) as CalendarSummaryDay[];
}

async function getNutritionSummaries(dateIds: string[], signal: AbortSignal) {
  if (dateIds.length === 0) return [];

  const response = await fetch(`/api/calendar/nutrition?ids=${encodeURIComponent(dateIds.join(","))}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard nutrition summary (${response.status})`);
  }

  const body: { data?: NutritionSummary[] } = await response.json();
  return body.data ?? [];
}

export default function SummaryCard({ title, value = 0, total = 0, labelSuffix, metric }: SummaryCardProps) {
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [counts, setCounts] = useState<SummaryCounts>({ value, total });

  useEffect(() => {
    if (!metric) {
      setCounts({ value, total });
      return;
    }

    const controller = new AbortController();

    async function fetchCounts() {
      try {
        const calendarDays = await getCalendarDays(currentYear, selectedMonth, controller.signal);
        const plannedDateIds = calendarDays.filter((day) => (day.entrees ?? []).length > 0).map((day) => day._id);

        if (metric === "mealsPlanned") {
          setCounts({
            value: plannedDateIds.length,
            total: getDaysInMonth(currentYear, selectedMonth),
          });
          return;
        }

        const nutritionSummaries = await getNutritionSummaries(plannedDateIds, controller.signal);

        setCounts({
          value: nutritionSummaries.filter((summary) => summary.quotaMet).length,
          total: plannedDateIds.length,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error loading dashboard summary:", error);
        setCounts({ value, total });
      }
    }

    fetchCounts();

    return () => controller.abort();
  }, [currentYear, metric, selectedMonth, total, value]);

  return (
    <div className="bg-white rounded-2xl p-5 font-montserrat">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black">{title}</h3>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 bg-radish-900 text-white px-4 py-2 rounded-lg font-semibold text-sm"
          >
            {MONTHS[selectedMonth]}
            <ChevronDown className="h-4 w-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-medium-gray rounded-lg shadow-lg z-10 w-36 max-h-60 overflow-y-auto">
              {MONTHS.map((month, idx) => (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedMonth(idx);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-radish-100 transition-colors ${
                    idx === selectedMonth ? "font-bold text-radish-900" : "text-pepper"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donut chart + label */}
      <div className="flex flex-col items-center gap-4">
        <DonutChart value={counts.value} total={counts.total} />
        <p className="text-base font-bold text-black text-center">
          {MONTHS[selectedMonth]} {labelSuffix}
        </p>
      </div>
    </div>
  );
}
