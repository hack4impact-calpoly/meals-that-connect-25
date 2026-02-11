import FilterMenu from "@/components/FilterMenu";
import Navbar from "@/components/Navbar";
import RecipeSummary from "@/components/RecipeSummary";
import WeeklyMenu from "@/components/WeeklyMenu";
import ComboCard from "@/components/ComboCard";
import CalendarRecipeItem from "@/components/CalendarRecipeItem";

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
      <WeeklyMenu dateToday={today} />
      <RecipeSummary id={"recipe_test_001"} />
      <RecipeSummary id={"mango"} />
      <RecipeSummary id={"masdf"} />
      <div className="w-100">
        <CalendarRecipeItem name="Spaghetti Bolognese" calories={850} servingSize="1 plate" tags={["Entree"]} />
      </div>
    </main>
  );
}
