import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Utensils } from "lucide-react";

type ComboCardProps = {
  name: string;
  imageUrl: string;
  tags: string[];
  serving: number;
};

const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Sides: "bg-sides-500 text-sides-900",
  Fruit: "bg-fruit-500 text-fruit-900",
  Entree: "bg-entree-900 text-entree-500",
  Entrée: "bg-entree-900 text-entree-500",
  fallback: "bg-gray-100 text-gray-700",
};

export default function ComboCard({ name, imageUrl, tags = [], serving }: ComboCardProps) {
  const servingText = serving != null ? `${serving}` : null;

  return (
    <div className="relative w-72 h-[346px] overflow-hidden rounded-[14px] border-2 border-gray-300 bg-white">
      <div className="relative h-28 w-full">
        {imageUrl ? <Image src={imageUrl} className="h-full w-full object-cover" fill sizes="288px" alt="" /> : null}
        <span className="absolute left-2 top-24 inline-flex rounded-full px-2 py-1.5 text-xs bg-combo-500 text-combo-900 font-montserrat font-semibold border-[3px] border-white">
          Combo
        </span>
      </div>

      <div className="flex h-[calc(100%-7rem)] flex-col min-h-0 p-4">
        <div className="space-y-3">
          <p className="mt-1 font-montserrat font-bold text-base text-combo-jicama">{name}</p>

          <div className="flex flex-col gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 text-xs font-medium font-montserrat bg-sides-500 text-sides-900`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-1">
          <Utensils className="h-2.5 w-2.5 text-combo-jicama" />
          <p className="font-montserrat italic text-xs">Serves {servingText}</p>
        </div>
      </div>
    </div>
  );
}
