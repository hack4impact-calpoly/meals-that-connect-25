import Image from "next/image";
import React from "react";
import { Utensils } from "lucide-react";

type ComboCardProps = {
  name: string;
  imageUrl?: string;
  tags: string[];
  serving: number;
  isDraft: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export default function ComboCard({
  name,
  imageUrl,
  tags = [],
  serving,
  isDraft = true,
  isSelected,
  onSelect,
}: ComboCardProps) {
  const servingText = serving != null ? `${serving}` : null;

  return (
    <div
      className={`relative w-72 h-[346px] overflow-hidden rounded-[14px] ${isSelected ? "border-3 border-radish-900" : isDraft ? "border-3 border-dashed border-gray-300" : "border-2 border-gray-300"} bg-white`}
    >
      <div className="relative h-28 w-full bg-medium-gray">
        {imageUrl ? <Image src={imageUrl} className="h-full w-full object-cover" fill sizes="288px" alt="" /> : null}
        {isDraft && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="absolute top-4 right-4 z-20 h-5 w-5 bg-white rounded-[2px] border-2 accent-radish-900 cursor-pointer"
          />
        )}
        <span
          className={`absolute left-2 top-24 inline-flex rounded-full px-4 py-1.5 text-base font-medium font-montserrat border-[3px] border-white ${isDraft ? "bg-light-gray text-combo-jicama italic" : "bg-combo-500 text-combo-900"}`}
        >
          {isDraft ? "Draft" : "Combo"}
        </span>
      </div>

      <div className="flex h-[calc(100%-7rem)] flex-col min-h-0 p-4">
        <div className="space-y-3">
          <p className="mt-3 font-montserrat font-bold text-base text-combo-jicama">{name}</p>

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
