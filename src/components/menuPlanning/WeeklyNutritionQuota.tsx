"use client";

import { NUTRIENT_LABELS, Nutrition, WEEKLY_NUTRITION_QUOTA, ZERO_NUTRITION } from "@/lib/types";

interface WeeklyNutritionQuotaProps {
  dailyTotals: Nutrition[];
}

function sumNutritionTotals(dailyTotals: Nutrition[]): Nutrition {
  return dailyTotals.reduce<Nutrition>(
    (total, day) => {
      for (const { key } of NUTRIENT_LABELS) {
        total[key] += day[key];
      }

      return total;
    },
    { ...ZERO_NUTRITION },
  );
}

export default function WeeklyNutritionQuota({ dailyTotals }: WeeklyNutritionQuotaProps) {
  const weeklyTotals = sumNutritionTotals(dailyTotals);

  const allMet = NUTRIENT_LABELS.every(({ key }) => weeklyTotals[key] >= WEEKLY_NUTRITION_QUOTA[key]);

  return (
    <div className="mt-4 rounded-xl border border-pepper/20 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-montserrat text-base font-semibold text-pepper">Weekly Nutrition Quota</h3>

        <span
          className={`rounded-full px-3 py-1 font-montserrat text-xs font-semibold ${
            allMet ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {allMet ? "Quota Met" : "Quota Not Met"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => {
          const current = weeklyTotals[key];
          const target = WEEKLY_NUTRITION_QUOTA[key];
          const met = current >= target;
          const progress = Math.min((current / target) * 100, 100);

          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-montserrat text-xs font-medium text-pepper">{label}</span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${met ? "bg-green-500" : "bg-radish-900"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="w-28 shrink-0 text-right font-montserrat text-xs text-pepper/70">
                {current}
                <span className="text-pepper/40">
                  {" "}
                  / {target} {unit}
                </span>
              </span>

              <span className="shrink-0 text-sm">{met ? "✓" : "✗"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
