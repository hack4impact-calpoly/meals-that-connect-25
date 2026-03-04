"use client";

import { useRouter } from "next/navigation";
import { StickyNote } from "lucide-react";

type Props = {
  variant: "recipe" | "combo";
  numDrafts: number;
};

export default function DraftEntryCard({ variant, numDrafts }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/drafts");
  };

  /*
    TODO: find a way to factor out the layout from ComboCard and RecipeCard
    to avoid code duplication.
    Maybe use the actual RecipeCard and ComboCard, but add some props for a "View Drafts" variant
  */

  // Combo-style
  if (variant === "combo") {
    return (
      <div
        onClick={handleClick}
        className="relative w-72 h-86.5 cursor-pointer overflow-hidden rounded-[14px] border-2 border-dashed border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 transition"
      >
        <div className="absolute flex flex-col justify-center items-center bg-pepper inset-0 rounded-xl hover:bg-zinc-600 transition">
          <span className="flex text-white text-lg font-semibold">View Drafts</span>
          <span className="flex items-center text-white">
            {" "}
            {numDrafts} Recipes <StickyNote className="mt-0.5" size={20} fill="white" color="#48494b" />{" "}
          </span>
        </div>
      </div>
    );
  }

  // Recipe-style
  return (
    <div
      onClick={handleClick}
      className="relative flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 px-5 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400"></div>
      <div className="absolute flex flex-col justify-center items-center bg-pepper inset-0 rounded-xl hover:bg-zinc-600 transition">
        <span className="flex text-white text-lg font-semibold">View Drafts</span>
        <span className="flex items-center text-white">
          {" "}
          {numDrafts} Recipes <StickyNote className="mt-0.5" size={20} fill="white" color="#48494b" />{" "}
        </span>
      </div>
    </div>
  );
}
