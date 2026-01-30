"use client";

import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">{formattedDate}</p>
      </div>
      <h1>Dashboard</h1>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <RecipeCard id={"recipe_test_001"} />
      <RecipeCard id={"mango"} />
      <RecipeCard id={"masdf"} />
    </main>
  );
}
