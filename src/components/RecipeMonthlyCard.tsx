import { GripVertical } from "lucide-react";

export type RecipeCardProps = {
  name: string;
  tags?: string[];
};

const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Sides: "bg-sides-500 text-black",
  Fruit: "bg-fruit-500 text-fruit-900",
  Entree: "bg-yellow-900 text-white",
  Entrée: "bg-yellow-900 text-white",
  fallback: "bg-gray-100 text-gray-700",
};

export default function RecipeMonthlyCard({ name, tags = [] }: RecipeCardProps) {
  const primaryTag = tags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;
  return (
    <div
      className={` ${tagStyle} flex justify-between items-center gap-1 rounded-md py-0.5 px-2 transition hover:shadow-md cursor-pointer min-w-0`}
    >
      <h3 className="truncate">{name}</h3>
      <GripVertical size={15} strokeWidth={1.7} className="cursor-move shrink-0" />
    </div>
  );
}
