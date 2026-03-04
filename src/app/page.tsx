import DashboardCalendar from "@/components/DashboardCalendar";
import WeeklyMenu from "@/components/WeeklyMenu";
import ComboCard from "@/components/ComboCard";
import DashboardDate from "@/components/DashboardDate";
import { FileText, PlusCircle } from "lucide-react";

export default function Home() {
  const today = new Date();
  const dayDateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="font-montserrat px-8 py-6">
      {/* Today's Meal (left), Calendar + date label (right) */}
      <div className="flex items-start gap-16">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-black">Today&apos;s Meal</h2>
          <div className="flex items-start gap-12">
            <DashboardDate />
            <ComboCard name="Italian Noodle Casserole" tags={["Mango Cup"]} serving={12} isDraft={false} />
          </div>
        </div>

        <div className="flex flex-1 items-start gap-16">
          <DashboardCalendar />
        </div>
      </div>

      {/* his Week's Menu (left), Recipe Shortcuts (right) */}
      <div className="mt-8 flex items-start gap-16">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-black">This Week&apos;s Menu</h2>
          <WeeklyMenu dateToday={today} />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-black">Recipe Shortcuts</h2>
          <div className="flex flex-col gap-3 w-72">
            <button className="flex w-full items-center justify-between rounded-md border border-cucumber bg-white px-4 py-2 text-sm font-medium text-cucumber hover:bg-cucumber/10">
              Add Item
              <PlusCircle className="h-5 w-5" />
            </button>
            <button className="flex w-full items-center justify-between rounded-md border border-cucumber bg-white px-4 py-2 text-sm font-medium text-cucumber hover:bg-cucumber/10">
              View Drafts
              <FileText className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
