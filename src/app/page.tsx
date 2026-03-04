import Navbar from "@/components/Navbar";
import WeeklyMenu from "@/components/WeeklyMenu";
import SummaryCard from "@/components/SummaryCard";

export default function Home() {
  const today = new Date();

  return (
    <main className="min-h-screen bg-light-gray font-montserrat">
      <Navbar />
      <div className="px-8 py-6">
        <div className="grid grid-cols-[3fr_2fr] gap-6 items-stretch">
          {/* Left – Greeting + Weekly Calendar */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-black">Hi, Brian!</h1>
            <WeeklyMenu dateToday={today} />
          </div>

          {/* Right – Summary Cards */}
          <div className="flex flex-col gap-4">
            <SummaryCard title="Meals Planned Summary" value={15} total={30} labelSuffix="Meals Planned" />
            <SummaryCard title="Nutrition Summary" value={15} total={15} labelSuffix="Meals Met Nutrition Quota" />
          </div>
        </div>
      </div>
    </main>
  );
}
