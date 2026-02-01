"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function Recipe() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold">Recipe</h1>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search Recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">Add Recipe</button>
        </div>
      </div>
    </main>
  );
}
