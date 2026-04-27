"use client";

import { CategoryValue, EMPTY_FILTERS } from "@/lib/types";
import { useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { Suspense } from "react";
import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import RecipePageClient from "@/components/RecipePageClient";

export default function RecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipePageClient />
    </Suspense>
  );
}
