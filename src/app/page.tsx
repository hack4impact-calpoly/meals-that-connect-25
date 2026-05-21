import WeeklyMenu from "@/components/WeeklyMenu";
import SummaryCard from "@/components/SummaryCard";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";

export default async function Home() {
  const today = new Date();

  const { userId } = await auth();
  await dbConnect();
  const currentUser = await User.findOne({ clerkId: userId });

  return (
    <main className="overflow-auto font-montserrat">
      <div className="px-8 py-6">
        {/* <div className="grid grid-cols-[3fr_2fr] gap-6 items-stretch"> */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-stretch">
          {/* Left – Greeting + Weekly Calendar */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-black">Hi, {currentUser?.name}!</h1>
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
