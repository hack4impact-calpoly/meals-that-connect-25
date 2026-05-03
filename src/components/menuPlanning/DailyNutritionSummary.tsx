"use client";

import NutritionalInfo from "@/components/NutrionalInfo";
import { Nutrition } from "@/lib/types";

interface DailyNutritionSummaryProps {
  recipes: Nutrition[];
}

export default function DailyNutritionSummary({ recipes }: DailyNutritionSummaryProps) {
  const totals = recipes.reduce(
    (acc, n) => ({
      calories: acc.calories + (n.calories ?? 0),
      protein: acc.protein + (n.protein ?? 0),
      fat: acc.fat + (n.fat ?? 0),
      carbs: acc.carbs + (n.carbs ?? 0),
      fiber: acc.fiber + (n.fiber ?? 0),
      sodium: acc.sodium + (n.sodium ?? 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0 },
  );

  return (
    <div className="rounded-xl border border-pepper/20 bg-white p-4 mt-4">
      <h3 className="text-base font-semibold font-montserrat text-pepper mb-3">Daily Nutrition Totals</h3>
      <div className="flex flex-wrap gap-2">
        <NutritionalInfo label="Calories" unit="kcal" value={String(totals.calories)} onChange={() => {}} readOnly />
        <NutritionalInfo label="Protein" unit="g" value={String(totals.protein)} onChange={() => {}} readOnly />
        <NutritionalInfo label="Fat" unit="g" value={String(totals.fat)} onChange={() => {}} readOnly />
        <NutritionalInfo label="Carbs" unit="g" value={String(totals.carbs)} onChange={() => {}} readOnly />
        <NutritionalInfo label="Fiber" unit="g" value={String(totals.fiber)} onChange={() => {}} readOnly />
        <NutritionalInfo label="Sodium" unit="mg" value={String(totals.sodium)} onChange={() => {}} readOnly />
      </div>
    </div>
  );
}
