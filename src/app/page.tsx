"use client";

import Navbar from "@/components/Navbar";

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
    </main>
  );
}
