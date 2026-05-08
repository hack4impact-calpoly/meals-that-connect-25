import { CategoryValue, EMPTY_FILTERS } from "@/lib/types";
// import { useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { Suspense } from "react";
import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import RecipePageClient from "@/components/RecipePageClient";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";

export default async function RecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipePageClient />
    </Suspense>
  );
}
