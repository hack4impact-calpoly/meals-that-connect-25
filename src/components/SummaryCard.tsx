"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DonutChartProps {
  value: number;
  total: number;
}

function DonutChart({ value, total }: DonutChartProps) {
  const size = 220;
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
  value: number;
  total: number;
  labelSuffix: string;
}

export default function SummaryCard({ title, value, total, labelSuffix }: SummaryCardProps) {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 font-montserrat">
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
        <DonutChart value={value} total={total} />
        <p className="text-base font-bold text-black text-center">
          {MONTHS[selectedMonth]} {labelSuffix}
        </p>
      </div>
    </div>
  );
}
