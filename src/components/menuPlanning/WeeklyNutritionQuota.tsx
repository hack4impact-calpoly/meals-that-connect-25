"use client";

import { Nutrition } from "@/lib/types";

// Weekly nutrition quota targets (per week across 5 days)
// TODO: move to types.ts, for easier comparison with nutrition schema
const WEEKLY_QUOTA: Nutrition = {
  calories: 3000,
  protein: 75,
  fat: 100,
  carbs: 350,
  fiber: 40,
  sodium: 3200,
};

// TODO: move to types.ts
const NUTRIENT_LABELS: Array<{ key: keyof Nutrition; label: string; unit: string }> = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
];

interface WeeklyNutritionQuotaProps {
  // One Nutrition entry per day (up to 5 days); each entry is the sum for that day
  dailyTotals: Nutrition[];
}

export default function WeeklyNutritionQuota({ dailyTotals }: WeeklyNutritionQuotaProps) {
  // TODO: make a helper function for this? maybe?
  const weeklyTotals = dailyTotals.reduce(
    (acc, day) => ({
      calories: acc.calories + (day.calories ?? 0),
      protein: acc.protein + (day.protein ?? 0),
      fat: acc.fat + (day.fat ?? 0),
      carbs: acc.carbs + (day.carbs ?? 0),
      fiber: acc.fiber + (day.fiber ?? 0),
      sodium: acc.sodium + (day.sodium ?? 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  );

  // TODO: make a helper for this
  const allMet = NUTRIENT_LABELS.every(({ key }) => weeklyTotals[key] >= WEEKLY_QUOTA[key]);

  return (
    <div className="rounded-xl border border-pepper/20 bg-white p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold font-montserrat text-pepper">Weekly Nutrition Quota</h3>
        <span
          className={`text-xs font-semibold font-montserrat px-3 py-1 rounded-full ${
            allMet ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {allMet ? "Quota Met" : "Quota Not Met"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => {
          const current = weeklyTotals[key];
          const target = WEEKLY_QUOTA[key];
          const met = current >= target;
          const progress = Math.min((current / target) * 100, 100);

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-16 text-xs font-montserrat font-medium text-pepper shrink-0">{label}</span>

              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${met ? "bg-green-500" : "bg-radish-900"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-xs font-montserrat text-pepper/70 w-28 text-right shrink-0">
                {current}
                <span className="text-pepper/40">
                  {" "}
                  / {target} {unit}
                </span>
              </span>

              <span className="text-sm shrink-0">{met ? "✓" : "✗"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
