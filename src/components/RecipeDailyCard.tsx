import Image from "next/image";
import { GripVertical } from "lucide-react";
import { Recipe, TAG_STYLES } from "@/lib/types";

export type RecipeCardProps = {
  item: Recipe;
  onOpen?: () => void;
};

export default function RecipeDailyCard({ item, onOpen }: RecipeCardProps) {
  const tagStyle = TAG_STYLES[item.category];

  const caloriesText = `${item.nutritional_info.calories} cal`;
  const servingText = `${item.serving}`;
  const metaText = `${caloriesText} / ${servingText}`;

  const handleCardClick = () => {
    if (item._id) {
      window.open(`/recipe?id=${item._id}`, "_blank", "noopener,noreferrer");
      return;
    }

    onOpen?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-6 transition hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-montserrat text-xl font-bold" title={item.name}>
          {item.name}
        </h3>

        <p className="font-montserrat text-base font-medium">{metaText}</p>
      </div>

      <span className={`shrink-0 rounded-md px-3 py-1.5 font-montserrat text-base font-medium ${tagStyle}`}>
        {item.category}
      </span>

      <GripVertical size={20} strokeWidth={1.7} className="cursor-move text-gray-500" />
    </div>
  );
}
