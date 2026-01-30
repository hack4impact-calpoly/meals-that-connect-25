import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";

export default function Home() {
  return (
    <main>
      <Navbar />
      <h1>Dashboard</h1>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <RecipeCard id={"recipe_test_001"} />
      <RecipeCard id={"mango"} />
      <RecipeCard id={"masdf"} />
    </main>
  );
}
