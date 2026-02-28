"use client";

import { useRouter } from "next/navigation";

type Props = {
  variant: "recipe" | "combo";
};

export default function DraftEntryCard({ variant }: Props) {
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
      ></div>
    );
  }

  // Recipe-style
  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-white py-6 px-5 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400"></div>
    </div>
  );
}
