import Navbar from "@/components/Navbar";
import RecipesClientPage from "@/components/RecipeClient"; // <-- update path/name to your client page component

export default function RecipesPage() {
  return (
    <div className="min-h-screen w-full bg-[#f7f7f7]">
      <Navbar />
      <RecipesClientPage />
    </div>
  );
}
