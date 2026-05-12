"use client";

import { ArrowUpRight } from "lucide-react";

type RecipeSeeMorePopoverProps = {
  recipeId: string;
  variant?: "compact" | "default";
};

export default function RecipeSeeMorePopover({ recipeId, variant = "default" }: RecipeSeeMorePopoverProps) {
  const href = `/recipe?id=${encodeURIComponent(recipeId)}`;
  const textSize = variant === "compact" ? "text-[11px]" : "text-xs";
  const iconSize = variant === "compact" ? "h-3 w-3" : "h-3.5 w-3.5";
  const rowMin = variant === "compact" ? "min-h-[1.125rem]" : "min-h-[1.375rem]";

  return (
    <div className={`shrink-0 ${rowMin} pt-0.5`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`pointer-events-none inline-flex w-fit max-w-full items-center gap-0.5 font-montserrat font-semibold text-current opacity-0 underline decoration-current/40 underline-offset-2 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 hover:decoration-current ${textSize}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        aria-label="See More: open recipe in new tab"
      >
        See More
        <ArrowUpRight className={`${iconSize} shrink-0`} strokeWidth={2.2} aria-hidden />
      </a>
    </div>
  );
}
