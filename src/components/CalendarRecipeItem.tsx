import { GripVertical } from "lucide-react";

export type CalendarRecipeItemProps = {
  name: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
};

const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Sides: "bg-lime text-black",
  Fruit: "bg-fruit-900 text-white",
  Entree: "bg-entree-900 text-white",
  Entrée: "bg-entree-900 text-white",
  fallback: "bg-pepper text-white",
};

export default function CalendarRecipeItem({ name, calories, servingSize, tags = [] }: CalendarRecipeItemProps) {
  const caloriesText = calories != null ? `${calories} cal` : null;
  const servingText = servingSize != null ? `${servingSize}` : null;
  const metaText = caloriesText && servingText ? `${caloriesText} / ${servingText}` : caloriesText || servingText;

  const primaryTag = tags[0];
  const tagStyle = (primaryTag && TAG_STYLES[primaryTag]) ?? TAG_STYLES.fallback;

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 font-montserrat ${tagStyle}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xl leading-tight font-bold" title={name}>
          {name}
        </p>
        {metaText ? <p className="mt-1 text-lg leading-tight font-medium">{metaText}</p> : null}
      </div>

      <GripVertical className="h-7 w-7 shrink-0 text-current" aria-hidden="true" />
    </div>
  );
}
