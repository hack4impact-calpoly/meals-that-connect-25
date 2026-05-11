"use client";

import NutritionalInfo from "@/components/NutrionalInfo";
import { Nutrition } from "@/lib/types";
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
