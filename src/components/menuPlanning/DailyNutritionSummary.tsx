"use client";

import NutritionalInfo from "@/components/NutrionalInfo";
import { Nutrition } from "@/lib/types";
import { emptyNutrition, sumNutrition } from "@/lib/nutrition";

interface DailyNutritionSummaryProps {
  recipes?: Nutrition[];
  total?: Nutrition;
}

const DAILY_NUTRITION_TARGETS = [
  { key: "calories", label: "Cals", target: 500 },
  { key: "carbs", label: "Carbs", target: 50 },
  { key: "protein", label: "Protein", target: 25 },
  { key: "fat", label: "Fat", target: 20 },
] as const;

function NutritionRing({ value, target, label }: { value: number; target: number; label: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(value / target, 1) : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative h-20 w-20">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
        <circle
          className="text-radish-100"
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        <circle
          className="text-radish-900"
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-montserrat leading-none">
        <span className="text-lg font-bold text-cucumber">{Math.round(value)}</span>
        <span className="mt-1 text-[10px] font-semibold text-pepper/70">
          / {target} {label}
        </span>
      </div>
    </div>
  );
}

export default function DailyNutritionSummary({ recipes = [], total }: DailyNutritionSummaryProps) {
  const totals = total ?? (recipes.length ? sumNutrition(recipes) : emptyNutrition());

  return (
    <>
      <div className="rounded-md bg-white p-4 shadow-sm md:hidden">
        <h3 className="mb-3 font-montserrat text-base font-bold text-pepper">Total Nutritional Information</h3>

        <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-3">
          {DAILY_NUTRITION_TARGETS.map((nutrient) => (
            <NutritionRing
              key={nutrient.key}
              value={totals[nutrient.key]}
              target={nutrient.target}
              label={nutrient.label}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 hidden rounded-xl border border-pepper/20 bg-white p-4 md:block">
        <h3 className="mb-3 font-montserrat text-base font-semibold text-pepper">Daily Nutrition Totals</h3>
        <div className="flex flex-wrap gap-2">
          <NutritionalInfo label="Calories" unit="kcal" value={String(totals.calories)} onChange={() => {}} readOnly />
          <NutritionalInfo label="Protein" unit="g" value={String(totals.protein)} onChange={() => {}} readOnly />
          <NutritionalInfo label="Fat" unit="g" value={String(totals.fat)} onChange={() => {}} readOnly />
          <NutritionalInfo label="Carbs" unit="g" value={String(totals.carbs)} onChange={() => {}} readOnly />
          <NutritionalInfo label="Fiber" unit="g" value={String(totals.fiber)} onChange={() => {}} readOnly />
          <NutritionalInfo label="Sodium" unit="mg" value={String(totals.sodium)} onChange={() => {}} readOnly />
        </div>
      </div>
    </>
  );
}
