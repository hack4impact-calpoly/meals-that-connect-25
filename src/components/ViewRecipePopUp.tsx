"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Recipe, Combo, RecipeReference } from "@/lib/types";
import {
  ArrowLeft,
  Maximize2,
  Share,
  Pencil,
  Ellipsis,
  Carrot,
  Apple,
  Tag,
  CircleAlert,
  SquarePen,
  Minus,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import NutritionalInfo from "./NutrionalInfo";

type Props = {
  open: boolean;
  onClose: (v: boolean) => void;
  item: Recipe | Combo | null;
  isComboMode: boolean;
  changeMode: (mode: "view" | "edit") => void;
};

export default function ViewRecipePopUp({ open, onClose, item, isComboMode, changeMode }: Props) {
  const [maximized, setMaximized] = useState(false);
  const [servings, setServings] = useState(item?.serving || 1);
  const originalServings = item?.serving || 1;

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [sodium, setSodium] = useState(0);

  const [entreeMap, setEntreeMap] = useState<RecipeReference[]>([]);
  const [sideMap, setSideMap] = useState<RecipeReference[]>([]);
  const [fruitMap, setFruitMap] = useState<RecipeReference[]>([]);

  const isRecipe = (item: Recipe | Combo): item is Recipe => {
    return "ingredients" in item;
  };

  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(`Failed to get individual recipe (${res.status})`);
    return res.json();
  }

  useEffect(() => {
    // get data on every entree/side/fruit for every combo and sum up nutritional info (this is needed because the nutritional info for combos is not stored in the db, but calculated on the fly)
    if (item && isRecipe(item) === false) {
      const loadAll = async () => {
        const [eM, sN, fN] = await Promise.all([
          Promise.all(
            (item.entrees ?? []).map(async (e) => {
              const r = await getRecipe(e);
              return { id: r._id, name: r.name };
            }),
          ),
          Promise.all(
            (item.sides ?? []).map(async (s) => {
              const r = await getRecipe(s);
              return { id: r._id, name: r.name };
            }),
          ),
          Promise.all(
            (item.fruits ?? []).map(async (f) => {
              const r = await getRecipe(f);
              return { id: r._id, name: r.name };
            }),
          ),
        ]);

        setSideMap(sN);
        setFruitMap(fN);
        setEntreeMap(eM);
      };

      loadAll();

      item.entrees?.forEach((e) => {
        // go through each entree information and sum up nutritional info
        getRecipe(e).then((recipe) => {
          setCalories((c) => recipe.nutritional_info.calories / recipe.serving);
          setProtein((p) => recipe.nutritional_info.protein / recipe.serving);
          setFat((f) => recipe.nutritional_info.fat / recipe.serving);
          setCarbs((c) => recipe.nutritional_info.carbs / recipe.serving);
          setFiber((f) => recipe.nutritional_info.fiber / recipe.serving);
          setSodium((s) => recipe.nutritional_info.sodium / recipe.serving);
        });
      });

      item.sides?.forEach((s) => {
        getRecipe(s).then((recipe) => {
          setCalories((c) => c + recipe.nutritional_info.calories / recipe.serving);
          setProtein((p) => p + recipe.nutritional_info.protein / recipe.serving);
          setFat((f) => f + recipe.nutritional_info.fat / recipe.serving);
          setCarbs((c) => c + recipe.nutritional_info.carbs / recipe.serving);
          setFiber((f) => f + recipe.nutritional_info.fiber / recipe.serving);
          setSodium((s) => s + recipe.nutritional_info.sodium / recipe.serving);
        });
      });

      item.fruits?.forEach((f) => {
        getRecipe(f).then((recipe) => {
          setCalories((c) => c + recipe.nutritional_info.calories / recipe.serving);
          setProtein((p) => p + recipe.nutritional_info.protein / recipe.serving);
          setFat((f) => f + recipe.nutritional_info.fat / recipe.serving);
          setCarbs((c) => c + recipe.nutritional_info.carbs / recipe.serving);
          setFiber((f) => f + recipe.nutritional_info.fiber / recipe.serving);
          setSodium((s) => s + recipe.nutritional_info.sodium / recipe.serving);
        });
      });
    } else if (item) {
      setCalories(item.nutritional_info.calories || 0);
      setProtein(item.nutritional_info.protein || 0);
      setFat(item.nutritional_info.fat || 0);
      setCarbs(item.nutritional_info.carbs || 0);
      setFiber(item.nutritional_info.fiber || 0);
      setSodium(item.nutritional_info.sodium || 0);
    }

    if (open && item?.serving) {
      setServings(item.serving);
    }
  }, [open, item]);

  if (!item) return null;

  const applyEditMode = () => {
    changeMode("edit");
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      {/* container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            className={`bg-white p-6 shadow-lg rounded-lg transition-all duration-300 
  ${
    maximized
      ? "fixed inset-0 w-screen h-screen max-w-none rounded-none z-50 overflow-y-auto"
      : "w-full max-w-3xl max-h-[90vh] overflow-y-auto"
  }`}
          >
            {/* header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ArrowLeft
                  className={`cursor-pointer ${maximized ? "" : "hidden"}`}
                  onClick={() => setMaximized((m) => !m)}
                />
                <Maximize2
                  className={`cursor-pointer transform -scale-y-100 ${maximized ? "hidden" : ""}`}
                  onClick={() => setMaximized((m) => !m)}
                />
              </div>
              <div className="flex flex-row gap-4">
                <Pencil className="cursor-pointer" onClick={applyEditMode} />
                <Ellipsis className="cursor-pointer" />
              </div>
            </div>

            {/* image */}
            <div className="relative h-50 w-full bg-medium-gray rounded-lg overflow-hidden">
              {"imageUrl" in item && item.imageUrl && (
                <div className="relative w-full h-64 mb-4">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
              {/* <span
                className={`absolute left-2 top-24 inline-flex rounded-full px-4 py-1.5 text-base font-medium font-montserrat border-[3px] border-white `}
              ></span> */}
            </div>

            {/* title */}
            <div className="text-2xl font-bold mb-4 mt-5">{item.name}</div>

            {/* entrees (combo) */}
            {"entrees" in item && item.entrees && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 py-1 font-bold">
                  <Carrot /> Entrees
                </h3>

                <div className="flex flex-wrap gap-2">
                  {entreeMap.map((e, i) => (
                    <div key={i} className="bg-brown text-white px-2 py-1 rounded-md flex items-center gap-1">
                      {e.name}
                      <button
                        onClick={() => window.open(`/recipe?id=${e.id}`)}
                        className="p-1 rounded hover:bg-brown/80 cursor-pointer"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* sides (combo) */}
            {"sides" in item && item.sides && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 py-1 font-bold">
                  <Carrot /> Sides
                </h3>

                <div className="flex flex-wrap gap-2">
                  {sideMap.map((s, i) => (
                    <div key={i} className="bg-lime px-2 py-1 rounded-md flex items-center gap-1">
                      {s.name}
                      <button
                        onClick={() => window.open(`/recipe?id=${s.id}`)}
                        className="p-1 rounded hover:bg-brown/80 cursor-pointer"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* fruits (combo) */}
            {"fruits" in item && item.fruits && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 py-1 font-bold">
                  <Apple /> Fruits
                </h3>

                <div className="flex flex-wrap gap-2">
                  {fruitMap.map((f, i) => (
                    <div key={i} className="bg-fruit-500 text-white px-2 py-1 rounded-md flex items-center gap-1">
                      {f.name}
                      <button
                        onClick={() => window.open(`/recipe?id=${f.id}`)}
                        className="p-1 rounded hover:bg-brown/80 cursor-pointer"
                      >
                        <ArrowUpRight size={20} />
                      </button>{" "}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* filters */}
            {"filters" in item && item.filters && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 py-1 font-bold shrink-0">
                  <Tag /> Filters
                </h3>

                <div className="flex flex-wrap gap-2 max-w-full">
                  {item.filters.map((f, i) => (
                    <div key={i} className="bg-pepper text-white px-2 py-1 rounded-md whitespace-nowrap">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* allergens */}
            {"allergens" in item && item.allergens && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 py-1 font-bold shrink-0">
                  <CircleAlert /> Allergens
                </h3>

                <div className="flex flex-wrap gap-2 max-w-full">
                  {item.allergens.map((f, i) => (
                    <div key={i} className="bg-pepper text-white px-2 py-1 rounded-md whitespace-nowrap">
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* notes */}
            {"notes" in item && item.notes && (
              <div className="flex mb-4">
                <h3 className="flex w-30 gap-2 font-bold">
                  <SquarePen /> Notes
                </h3>
                <p>{item.notes}</p>
              </div>
            )}

            <div className="hidden md:block h-px w-full bg-medium-gray my-8" />

            {/* servings */}
            <h3 className="text-xl mb-4 font-semibold">Servings</h3>
            {"serving" in item && (
              <div className="flex items-center w-min border border-gray-600 rounded-md">
                <button
                  className="bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                >
                  <Minus />
                </button>
                <span className="text-center w-15 font-mono">{servings}</span>
                <button
                  className="bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                  onClick={() => setServings((s) => s + 1)}
                >
                  <Plus />
                </button>
              </div>
            )}

            {/* ingredients (recipe) */}
            {"ingredients" in item && item.ingredients && (
              <>
                <div className="hidden md:block h-px w-full bg-medium-gray my-8" />
                <div className="mb-4">
                  <h3 className="text-xl mb-4 font-semibold">Ingredients</h3>

                  <ul className="list-disc pl-5">
                    {item.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.name}: {(ing.quantity / originalServings) * servings} {ing.units}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* instructions */}
            {"instructions" in item && item.instructions && (
              <>
                <div className="hidden md:block h-px w-full bg-medium-gray my-8" />
                <div className="mb-4">
                  <h3 className="text-xl mb-4 font-semibold">Instructions</h3>
                  <p className="whitespace-pre-wrap">{item.instructions}</p>
                </div>
              </>
            )}

            {/* nutritional info */}
            <div className="hidden md:block h-px w-full bg-medium-gray my-8" />
            <h3 className="text-xl mb-4 font-semibold">Nutritional Information</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <NutritionalInfo
                label="Calories"
                unit="kcal"
                value={((calories / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
              <NutritionalInfo
                label="Protein"
                unit="g"
                value={((protein / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
              <NutritionalInfo
                label="Fat"
                unit="g"
                value={((fat / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
              <NutritionalInfo
                label="Carbs"
                unit="g"
                value={((carbs / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
              <NutritionalInfo
                label="Fiber"
                unit="g"
                value={((fiber / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
              <NutritionalInfo
                label="Sodium"
                unit="mg"
                value={((sodium / originalServings) * servings).toString()}
                onChange={() => {}}
                readOnly={true}
              />
            </div>
          </DialogPanel>
        </div>
      </div>{" "}
    </Dialog>
  );
}
