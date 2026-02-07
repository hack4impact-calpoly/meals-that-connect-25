"use client";

import FilterMenu from "@/components/FilterMenu";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/Searchbar";
import AddItemButton from "@/components/AddItem";
import ComboCard from "@/components/ComboCard";
import { useEffect, useState } from "react";

export default function Recipe() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold">Recipe</h1>

        <div className="mt-4 flex items-center gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search a recipe" />
          <AddItemButton />
        </div>
        <ComboCard
          name="Chicken Tikka Masala"
          imageUrl="/masala.jpg"
          tags={["Brown Rice", "Scandinavian Vegetable Blend", "Carrot Salad", "Mango Cup"]}
          serving={10}
        />
        <FilterMenu />
      </div>
    </main>
  );
}
