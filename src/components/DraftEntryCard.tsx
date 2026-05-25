"use client";

import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";

type Props = {
  variant: "recipe" | "Combo";
  numDrafts: number;
};

export default function DraftEntryCard({ variant, numDrafts }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/drafts");
  };

  if (variant === "Combo") {
    return (
      <div
        onClick={handleClick}
        className="relative h-86.5 cursor-pointer overflow-hidden rounded-[14px] border-2 border-dashed border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition"
      >
        <div className="absolute flex flex-col justify-center items-center bg-pepper inset-0 rounded-xl hover:bg-zinc-600 transition">
          <span className="flex text-white text-lg font-semibold">View Drafts</span>
          <span className="flex items-center text-white">
            {" "}
            {numDrafts} Combos <StickyNote className="mt-0.5" size={20} fill="white" color="#48494b" />{" "}
          </span>
        </div>
      </div>
    );
  }

  // Recipe-style
  return (
    <div
      onClick={handleClick}
      className="relative flex items-center gap-3 md:gap-4 rounded-lg md:rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 md:py-6 px-4 md:px-5 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="h-16 md:h-20 w-16 md:w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"></div>
      <div className="absolute flex flex-col justify-center items-center bg-pepper inset-0 rounded-lg md:rounded-xl hover:bg-zinc-600 transition">
        <span className="flex text-white text-sm md:text-lg font-semibold">View Drafts</span>
        <span className="flex items-center text-white text-xs md:text-base gap-1">
          {" "}
          {numDrafts} Recipes{" "}
          <StickyNote className="mt-0.5 md:w-5 md:h-5" size={16} fill="white" color="#48494b" />{" "}
        </span>
      </div>
    </div>
  );
}
