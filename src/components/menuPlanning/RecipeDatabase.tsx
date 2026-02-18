"use client";
import { useState, useEffect } from "react";
import { Recipe } from "@/interface/recipe";
import { SlidersHorizontal } from "lucide-react";
import DraggableRecipeCard from "./DraggableRecipeCard";

interface RecipeDatabaseProps {
  recipes: Recipe[];
}

export default function RecipeDatabase({ recipes }: RecipeDatabaseProps) {
  const [value, setValue] = useState("");

  return (
    <div className="p-6 h-[calc(100vh-140px)] overflow-y-auto">
      <div className="text-xl font-semibold mb-6">Recipe Database</div>
      <div className="flex flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Search a recipe"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-md border border-medium-gray py-2.5 pl-10 pr-4 "
        />
        <span className="bg-radish-900 rounded-lg p-2">
          <SlidersHorizontal className="cursor-pointer" color="white" size={24} strokeWidth={1.7} />
        </span>
      </div>
      <div className="my-2">placeholder for buttons</div>
      <div>
        {recipes.map((recipe) => (
          <DraggableRecipeCard
            key={recipe.id}
            imageUrl={""}
            name={recipe.name}
            calories={0}
            servingSize={"100g"}
            tags={recipe.tags}
          />
        ))}
      </div>
    </div>
  );
}
