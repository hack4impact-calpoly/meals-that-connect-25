import { GripVertical } from "lucide-react";

export type WeekMealCardData = {
  id: string;
  name: string;
  calories?: number;
  servingSize?: string;
  tag?: "Entree" | "Sides" | "Fruit" | "Combo" | string;
  backgroundColor?: string;
  textColor?: string;
};

type WeekMealCardProps = WeekMealCardData;

const CARD_STYLE_BY_TAG: Record<string, { backgroundColor: string; textColor: string }> = {
  Combo: {
    backgroundColor: "var(--color-jicama)",
    textColor: "var(--color-radish-900)",
  },
  Sides: {
    backgroundColor: "var(--color-lime)",
    textColor: "var(--color-pepper)",
  },
  Fruit: {
    backgroundColor: "var(--color-fruit-900)",
    textColor: "#ffffff",
  },
  Entree: {
    backgroundColor: "var(--color-entree-500)",
    textColor: "var(--color-pepper)",
  },
};

const DEFAULT_CARD_STYLE = {
  backgroundColor: "var(--color-pepper)",
  textColor: "#ffffff",
};

export default function WeekMealCard({
  name,
  calories,
  servingSize,
  tag,
  backgroundColor,
  textColor,
}: WeekMealCardProps) {
  const tagStyle = tag ? (CARD_STYLE_BY_TAG[tag] ?? DEFAULT_CARD_STYLE) : DEFAULT_CARD_STYLE;
  const resolvedBackgroundColor = backgroundColor ?? tagStyle.backgroundColor;
  const resolvedTextColor = textColor ?? tagStyle.textColor;
  const caloriesText = calories != null ? `${calories} cal` : null;
  const metaText = caloriesText && servingSize ? `${caloriesText} / ${servingSize}` : caloriesText || servingSize;

  return (
    <div
      className="flex items-center gap-3 rounded-md px-4 py-3 font-montserrat shadow-[0_2px_6px_rgba(72,73,75,0.08)]"
      style={{ backgroundColor: resolvedBackgroundColor, color: resolvedTextColor }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] leading-tight font-bold" title={name}>
          {name}
        </p>
        {metaText ? <p className="mt-1 truncate text-[15px] leading-tight font-medium">{metaText}</p> : null}
      </div>

      <GripVertical className="h-5 w-5 shrink-0 text-current opacity-90" aria-hidden="true" />
    </div>
  );
}
