import Image from "next/image";
import { GripVertical } from "lucide-react";
import { Recipe, TAG_STYLES } from "@/lib/types";

export type RecipeCardProps = {
  item?: Recipe;
  imageUrl?: string;
  name: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
  onOpen?: () => void;
};

export default function RecipeDailyCard({
  item,
  imageUrl,
  name,
  calories,
  servingSize,
  tags = [],
  onOpen,
}: RecipeCardProps) {
  // TODO: why all this "resolved" stuff?
  const recipeId = item?._id;
  const resolvedImageUrl = item?.imageUrl ?? imageUrl;
  const resolvedName = item?.name ?? name;
  const resolvedCalories = item?.nutritional_info.calories ?? calories;
  const resolvedServingSize = item?.serving != null ? `${item.serving}` : servingSize;
  const resolvedTags = item?.filters ?? tags; // TODO: fix this

  const caloriesText = resolvedCalories != null ? `${resolvedCalories} cal` : null;

  const servingText = resolvedServingSize != null ? `${resolvedServingSize}` : null;

  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const primaryTag = resolvedTags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;
  const handleCardClick = () => {
    if (recipeId) {
      window.open(`/recipe?id=${recipeId}`, "_blank", "noopener,noreferrer");
      return;
    }

    onOpen?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex items-center gap-4 rounded-xl border-2 border-gray-300 bg-white px-5 py-6 transition hover:shadow-md cursor-pointer"
    >
      <div className="relative shrink-0 h-20 w-20 overflow-hidden rounded-md bg-gray-100">
        {resolvedImageUrl ? (
          <Image src={resolvedImageUrl} alt={resolvedName} fill sizes="80px" className="object-cover" />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="truncate text-xl font-bold font-montserrat" title={resolvedName}>
          {resolvedName}
        </h3>
        {metaText ? <p className="text-base font-medium font-montserrat">{metaText}</p> : null}
      </div>

      {primaryTag ? (
        <span className={`shrink-0 rounded-md px-3 py-1.5 text-base font-medium font-montserrat ${tagStyle}`}>
          {primaryTag}
        </span>
      ) : null}

      <GripVertical size={20} strokeWidth={1.7} className="cursor-move text-gray-500" />
    </div>
  );
}
