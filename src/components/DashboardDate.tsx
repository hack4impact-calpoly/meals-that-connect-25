"use client";

export default function DashboardDate() {
  const today = new Date();
  const month = today.toLocaleDateString("en-US", { month: "long" });
  const day = today.getDate();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-black bg-white px-8 py-5 font-montserrat">
      <span className="text-base font-bold text-black">{month}</span>
      <span className="py-1 text-6xl font-bold leading-none text-black">{day}</span>
      <span className="text-base font-bold text-black">{weekday}</span>
    </div>
  );
}
