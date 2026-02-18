"use client";

import { useState, useEffect } from "react";
import { Recipe } from "@/interface/recipe";
import WeekView from "@/components/menuPlanning/WeekView";
import Navbar from "@/components/Navbar";
import RecipeDatabase from "@/components/menuPlanning/RecipeDatabase";

const today = new Date();

export default function MenuPlanning() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();
        console.log(data);
        setRecipes(data.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRecipes();
  }, []);

  return (
    <main className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-row grow">
        <div className="flex flex-1 justify-center items-center bg-gray-100">
          <WeekView dateToday={today} />
        </div>
        <div className="w-[413px] h-full">
          <RecipeDatabase recipes={recipes} />
        </div>
      </div>
    </main>
  );
}
