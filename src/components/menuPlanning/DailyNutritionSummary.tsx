"use client";

import NutritionalInfo from "@/components/NutrionalInfo";
import { NUTRIENT_LABELS, Nutrition } from "@/lib/types";
import { emptyNutrition, sumNutrition } from "@/lib/nutrition";

interface DailyNutritionSummaryProps {
  recipes?: Nutrition[];
  total?: Nutrition;
}

export default function DailyNutritionSummary({ recipes = [], total }: DailyNutritionSummaryProps) {
  const totals = total ?? (recipes.length ? sumNutrition(recipes) : emptyNutrition());

  return (
    <div className="rounded-xl border border-pepper/20 bg-white p-4 mt-4">
      <h3 className="text-base font-semibold font-montserrat text-pepper mb-3">Daily Nutrition Totals</h3>
      <div className="flex flex-wrap gap-2">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => (
          <NutritionalInfo
            key={key}
            label={label}
            unit={unit}
            value={String(totals[key] ?? 0)}
            onChange={() => {}}
            readOnly
          />
        ))}
      </div>
    </div>
  );
}
