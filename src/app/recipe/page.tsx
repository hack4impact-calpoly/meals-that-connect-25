"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Search, PlusCircle } from "lucide-react";

export default function Recipe() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold">Recipe</h1>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-pink-500" />
            <input
              type="text"
              placeholder="Search a recipe"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-120 rounded-md border border-gray-300 py-2.5 pl-10 pr-4 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-md border border-green-700 bg-white px-4 py-2 text-green-700 hover:bg-green-50">
            Add Item
            <PlusCircle className="h-5 w-5 text-green-700" />
          </button>
        </div>
      </div>
    </main>
  );
}
