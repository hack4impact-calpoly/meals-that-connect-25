import Image from "next/image";
import { Pencil, Utensils } from "lucide-react";
import { Combo, Recipe } from "@/lib/types";
import { useEffect, useState } from "react";
import CreateRecipePopUp from "./CreateRecipePopUp";

type ComboCardProps = {
  item: Combo;
  name: string;
  imageUrl?: string;
  entrees: string[];
  vegetables: string[];
  grains: string[];
  fruits: string[];
  serving: number;
  isDraft: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

export default function ComboCard({
  item,
  name,
  imageUrl,
  entrees,
  vegetables,
  grains,
  fruits,
  serving,
  isDraft = true,
  isSelected,
  onSelect,
  onOpen,
}: ComboCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [entreeMap, setEntreeMap] = useState<string[]>([]);
  const [vegetableMap, setVegetableMap] = useState<string[]>([]);
  const [grainMap, setGrainMap] = useState<string[]>([]);
  const [fruitMap, setFruitMap] = useState<string[]>([]);

  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(`Failed to get individual recipe (${res.status})`);
    return res.json();
  }

  useEffect(() => {
    const loadAll = async () => {
      const [entreeNames, vegetableNames, grainNames, fruitNames] = await Promise.all([
        Promise.all(entrees.map(async (e) => (await getRecipe(e)).name)),
        Promise.all(vegetables.map(async (s) => (await getRecipe(s)).name)),
        Promise.all(grains.map(async (s) => (await getRecipe(s)).name)),
        Promise.all(fruits.map(async (f) => (await getRecipe(f)).name)),
      ]);

      setEntreeMap(entreeNames);
      setVegetableMap(vegetableNames);
      setGrainMap(grainNames);
      setFruitMap(fruitNames);
    };

    loadAll();
  }, []);

  const servingText = serving != null ? `${serving}` : null;

  return (
    <div
      onClick={onOpen} // TODO: cursor pointer only if onOpen is provided?
      className={`relative w-83 h-86.5 overflow-hidden rounded-[14px] cursor-pointer ${isSelected ? "border-3 border-radish-900" : isDraft ? "border-3 border-dashed border-gray-300" : "border-2 border-gray-300"} bg-white`}
    >
      <div className="relative h-28 w-full bg-medium-gray">
        {imageUrl ? <Image src={imageUrl} className="h-full w-full object-cover" fill sizes="288px" alt="" /> : null}

        {editMode === true && (
          <CreateRecipePopUp
            onClose={() => setEditMode(false)}
            item={item}
            open={true}
            recipeType={{ id: "Combo", label: "Add Combo", icon: Utensils }}
            editMode={true}
          />
        )}

        {isDraft && (
          <Pencil
            className="absolute top-35 right-4 z-20 h-5 w-5 rounded-xs accent-radish-900 cursor-pointer"
            onClick={() => setEditMode((prev) => !prev)}
          />
        )}

        {isDraft && onSelect && (
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            onClick={(e) => e.stopPropagation()} // stop modal from opening on checkbox click
            className="absolute top-4 right-4 z-20 h-5 w-5 bg-white rounded-xs border-2 accent-radish-900 cursor-pointer"
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

          <div className="flex flex-col gap-1.5 max-h-30 overflow-y-auto">
            {entreeMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 text-xs font-medium font-montserrat bg-entree-900 text-entree-500`}
              >
                {i}
              </span>
            ))}
            {fruitMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 text-xs font-medium font-montserrat bg-fruit-500 text-white`}
              >
                {i}
              </span>
            ))}
            {vegetableMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 text-xs font-medium font-montserrat bg-veg-500 text-veg-900`}
              >
                {i}
              </span>
            ))}
            {grainMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 text-xs font-medium font-montserrat bg-veg-500 text-veg-900`}
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-1 ml-auto">
          <Utensils className="h-2.5 w-2.5 text-combo-jicama" />
          <p className="font-montserrat text-xs">Serves {servingText}</p>
        </div>
      </div>
    </div>
  );
}
