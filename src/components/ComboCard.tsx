import Image from "next/image";
import { Pencil, Utensils } from "lucide-react";
import { Combo, Recipe, TAG_STYLES } from "@/lib/types";
import { useEffect, useState } from "react";
import CreateRecipePopUp from "./CreateRecipePopUp";

type ComboCardProps = {
  item: Combo;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

export default function ComboCard({ item, isSelected, onSelect, onOpen }: ComboCardProps) {
  const [editMode, setEditMode] = useState(false);
  const [entreeMap, setEntreeMap] = useState<string[]>([]);
  const [vegetableMap, setVegetableMap] = useState<string[]>([]);
  const [fruitMap, setFruitMap] = useState<string[]>([]);
  const [grainMap, setGrainMap] = useState<string[]>([]);

  const entrees = item.entrees ?? [];
  const vegetables = item.vegetables ?? [];
  const fruits = item.fruits ?? [];
  const grains = item.grains ?? [];

  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(`Failed to get individual recipe (${res.status})`);
    return res.json();
  }

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [entreeNames, vegetableNames, fruitNames, grainNames] = await Promise.all([
          Promise.all(entrees.map(async (e) => (await getRecipe(e)).name)),
          Promise.all(vegetables.map(async (v) => (await getRecipe(v)).name)),
          Promise.all(fruits.map(async (f) => (await getRecipe(f)).name)),
          Promise.all(grains.map(async (g) => (await getRecipe(g)).name)),
        ]);

        setEntreeMap(entreeNames);
        setVegetableMap(vegetableNames);
        setFruitMap(fruitNames);
        setGrainMap(grainNames);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Failed to load combo recipe names:", err);
      }
    };

    loadAll();
  }, []);

  const servingText = item.serving != null ? `${item.serving}` : null;

  return (
    <div
      onClick={onOpen}
      className={`relative h-86.5 cursor-pointer overflow-hidden rounded-[14px] ${
        isSelected
          ? "border-3 border-radish-900"
          : item.isDraft
            ? "border-3 border-dashed border-gray-300"
            : "border-2 border-gray-300"
      } bg-white`}
    >
      <div className="relative h-28 w-full bg-medium-gray">
        {item.imageUrl ? (
          <Image src={item.imageUrl} className="h-full w-full object-cover" fill sizes="288px" alt="" />
        ) : null}

        {editMode === true && (
          <CreateRecipePopUp
            onClose={() => setEditMode(false)}
            item={item}
            open={true}
            recipeType={{ id: "Combo", label: "Add Combo", icon: Utensils }}
            editMode={true}
          />
        )}

        {item.isDraft && (
          <Pencil
            className="absolute top-35 right-4 z-20 h-5 w-5 cursor-pointer rounded-xs accent-radish-900"
            onClick={(e) => {
              e.stopPropagation();
              setEditMode((prev) => !prev);
            }}
          />
        )}

        {item.isDraft && onSelect && (
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 z-20 h-5 w-5 cursor-pointer rounded-xs border-2 bg-white accent-radish-900"
          />
        )}

        <span
          className={`absolute left-2 top-24 inline-flex rounded-full border-[3px] border-white px-4 py-1.5 font-montserrat text-base ${
            item.isDraft ? "bg-light-gray text-combo-text italic" : TAG_STYLES.Combo
          }`}
        >
          {item.isDraft ? "Draft" : "Combo"}
        </span>
      </div>

      <div className="flex h-[calc(100%-7rem)] min-h-0 flex-col p-4">
        <div className="space-y-3">
          <p className="mt-3 font-montserrat text-base font-bold">{item.name}</p>

          <div className="flex max-h-30 flex-col gap-1.5 overflow-y-auto">
            {entreeMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 font-montserrat text-xs font-medium ${TAG_STYLES.Entree}`}
              >
                {i}
              </span>
            ))}

            {vegetableMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 font-montserrat text-xs font-medium ${TAG_STYLES.Vegetable}`}
              >
                {i}
              </span>
            ))}

            {fruitMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 font-montserrat text-xs font-medium ${TAG_STYLES.Fruit}`}
              >
                {i}
              </span>
            ))}

            {grainMap.map((i) => (
              <span
                key={i}
                className={`inline-flex w-fit shrink-0 rounded-md px-3 py-1.5 font-montserrat text-xs font-medium ${TAG_STYLES.Grain}`}
              >
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto ml-auto flex items-center gap-1">
          <Utensils className="h-2.5 w-2.5 text-combo-text" />
          <p className="font-montserrat text-xs">Serves {servingText}</p>
        </div>
      </div>
    </div>
  );
}
