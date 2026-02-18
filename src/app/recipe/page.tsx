import Navbar from "@/components/Navbar";
import RecipesClientPage from "@/components/RecipeClient"; // <-- update path/name to your client page component
import SearchBar from "@/components/Searchbar";
import AddItemButton from "@/components/AddItem";
import ComboCard from "@/components/ComboCard";
import RecipeCard from "@/components/RecipeCard";
import { useEffect, useState } from "react";

export default function Recipe() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<string | null>(null);

export default function RecipesPage() {
  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <Navbar />
      <RecipesClientPage />
    </div>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Recipe</h1>

        <div className="mt-4 flex items-center gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search a recipe" />
          <AddItemButton />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <RecipeCard name="Brown Rice" calories={200} isDraft={true} />
            <RecipeCard name="Brown Rice" calories={200} isDraft={false} />
          </div>

          <div className="flex gap-4">
            <ComboCard
              name="Brown Rice + Chicken"
              tags={["High Protein"]}
              serving={2}
              isDraft={true}
              isSelected={selectedName === "Brown Rice [Draft]"}
              onSelect={() => setSelectedName(selectedName === "Brown Rice [Draft]" ? null : "Brown Rice [Draft]")}
            />
            <ComboCard
              name="Not a Draft Recipe"
              tags={["High Protein"]}
              serving={2}
              isDraft={false}
              isSelected={selectedName === "Not a Draft Recipe"}
              onSelect={() => setSelectedName(selectedName === "Not a Draft Recipe" ? null : "Not a Draft Recipe")}
            />
          </div>
        </div>

        <FilterMenu />
      </div>
    </main>
  );
}
