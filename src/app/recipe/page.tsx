"use client";

import { Suspense } from "react";
import RecipePageClient from "@/components/recipe/RecipePageClient";

export default function RecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipePageClient />
    </Suspense>
  );
}
