import { GripVertical } from "lucide-react";
import { Recipe, TAG_STYLES } from "@/lib/types";

export type RecipeCardProps = {
  item?: Recipe;
  name: string;
  tags?: string[]; // TODO: not tags anymore
};

export default function RecipeMonthlyCard({ item, name, tags = [] }: RecipeCardProps) {
  const recipeId = item?._id;
  const resolvedName = item?.name ?? name;
  const resolvedTags = item?.filters ?? tags;
  const primaryTag = resolvedTags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;
  const handleCardClick = () => {
    if (!recipeId) return;
    window.open(`/recipe?id=${recipeId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${tagStyle} flex justify-between items-center gap-1 rounded-md py-0.5 px-2 transition hover:shadow-md cursor-pointer min-w-0`}
    >
      <h3 className="truncate">{resolvedName}</h3>
      <GripVertical size={15} strokeWidth={1.7} className="cursor-move shrink-0" />
    </div>
  );
}
