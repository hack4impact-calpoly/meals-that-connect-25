import { Suspense } from "react";
import RecipePageClient from "@/components/RecipePageClient";

export default function RecipePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecipePageClient />
    </Suspense>
  );
}
