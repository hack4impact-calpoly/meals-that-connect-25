import WeeklyMenu from "@/components/WeeklyMenu";
import SummaryCard from "@/components/SummaryCard";

export default function Home() {
  const today = new Date();

  return (
    <main className="overflow-auto font-montserrat">
      <div className="px-8 py-6">
        {/* <div className="grid grid-cols-[3fr_2fr] gap-6 items-stretch"> */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-stretch">
          {/* Left – Greeting + Weekly Calendar */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-black">Hi, Brian!</h1>
            <WeeklyMenu dateToday={today} />
          </div>

          {/* Right – Summary Cards */}
          <div className="flex flex-col gap-4">
            <SummaryCard title="Meals Planned Summary" labelSuffix="Meals Planned" metric="mealsPlanned" />
            <SummaryCard title="Nutrition Summary" labelSuffix="Meals Met Nutrition Quota" metric="nutritionMet" />
          </div>
        </div>
      </div>
    </main>
  );
}
