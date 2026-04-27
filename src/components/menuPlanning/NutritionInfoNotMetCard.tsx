import { CircleAlert } from "lucide-react";

export default function NutritionInfoNotMetCard() {
  return (
    <div className="mt-auto rounded-[10px] border-l-4 border-[#E30A0E] bg-[#e30a0e14] px-3 py-3 font-montserrat text-black">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E30A0E] text-white">
          <CircleAlert className="h-4 w-4" aria-hidden="true" />
        </div>
        <p className="text-[16px] leading-tight font-bold">Warning</p>
      </div>
      <p className="mt-1 text-[15px] leading-tight font-medium">Nutrition info quota not met</p>
    </div>
  );
}
