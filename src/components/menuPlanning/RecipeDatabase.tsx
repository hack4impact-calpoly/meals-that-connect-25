"use client";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import DraggableRecipeCard from "./DraggableRecipeCard";

interface RecipeDatabaseItem {
  _id?: string;
  id?: string;
  name: string;
  serving?: number;
  tags?: string[];
  itemType?: "recipe" | "combo";
}

interface RecipeDatabaseProps {
  recipes: RecipeDatabaseItem[];
}

export default function RecipeDatabase({ recipes }: RecipeDatabaseProps) {
  const [value, setValue] = useState("");

  const filteredRecipes = recipes.filter((recipe) => recipe.name.toLowerCase().includes(value.toLowerCase()));

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
      <div className="flex flex-col gap-4">
        {filteredRecipes.map((recipe) => {
          const recipeId = recipe._id || recipe.id;
          return (
            <DraggableRecipeCard
              key={recipeId}
              recipeId={recipeId || ""}
              imageUrl={""}
              name={recipe.name}
              calories={0}
              servingSize={recipe.serving ? `${recipe.serving} servings` : "100g"}
              tags={recipe.tags}
              itemType={recipe.itemType}
              sides={recipe.sides}
              fruits={recipe.fruits}
            />
          );
        })}
      </div>
    </div>
  );
}
