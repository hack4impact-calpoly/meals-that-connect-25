import { GripVertical } from "lucide-react";
import { Recipe, TAG_STYLES } from "@/lib/types";

export type RecipeCardProps = {
  item: Recipe;
};

export default function RecipeMonthlyCard({ item }: RecipeCardProps) {
  const recipeId = item._id;
  const tagStyle = TAG_STYLES[item.category];

  const handleCardClick = () => {
    window.open(`/recipe?id=${recipeId}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${tagStyle} flex justify-between items-center gap-1 rounded-md py-0.5 px-2 transition hover:shadow-md cursor-pointer min-w-0`}
    >
      <h3 className="truncate">{item.name}</h3>
      <GripVertical size={15} strokeWidth={1.7} className="cursor-move shrink-0" />
    </div>
  );
}
