"use client";

import FilterMenu from "@/components/FilterMenu";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/Searchbar";
import AddItemButton from "@/components/AddItem";
import { useState } from "react";

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
        <FilterMenu />
      </div>
    </main>
  );
}
