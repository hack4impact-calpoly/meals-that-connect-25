"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Recipe, Combo } from "@/lib/types";
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

  useEffect(() => {
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
                  {item.entrees.map((s, i) => (
                    <div key={i} className="bg-lime px-2 py-1 rounded-md">
                      {s.name}
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
                  {item.sides.map((s, i) => (
                    <div key={i} className="bg-lime px-2 py-1 rounded-md">
                      {s.name}
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
                  {item.fruits.map((f, i) => (
                    <div key={i} className="bg-fruit-900 text-white px-2 py-1 rounded-md">
                      {f.name}
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
                <span className="text-center w-8 font-mono">{servings}</span>
                <button
                  className="bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                  onClick={() => setServings((s) => s + 1)}
                >
                  <Plus />
                </button>
              </div>
            )}

            <div className="hidden md:block h-px w-full bg-medium-gray my-8" />

            {/* ingredients (recipe) */}
            {/* TODO: figma shows that combos also have ingredients, but the schema doesnt (maybe its just sides + fruit?) */}
            {"ingredients" in item && item.ingredients && (
              <>
                <div className="mb-4">
                  <h3 className="text-xl mb-4 font-semibold">Ingredients</h3>

                  <ul className="list-disc pl-5">
                    {item.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.name}: {ing.quantity * servings} {ing.units}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="hidden md:block h-px w-full bg-medium-gray my-8" />
              </>
            )}

            {/* instructions */}
            {/* TODO: fix instructions schema (change from string -> array) */}
            {"instructions" in item && item.instructions && (
              <div className="mb-4">
                <h3 className="text-xl mb-4 font-semibold">Instructions</h3>
                <p className="whitespace-pre-wrap">{item.instructions}</p>
              </div>
            )}

            {/* nutritional info (combo) */}
            {"nutritional_info" in item && item.nutritional_info && (
              <>
                <div className="hidden md:block h-px w-full bg-medium-gray my-8" />
                <h3 className="text-xl mb-4 font-semibold">Nutritional Information</h3>
                <div className="mt-3 flex flex-wrap gap-3">
                  <NutritionalInfo
                    label="Calories"
                    unit="kcal"
                    value={(item.nutritional_info.calories * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                  <NutritionalInfo
                    label="Protein"
                    unit="g"
                    value={(item.nutritional_info.protein * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                  <NutritionalInfo
                    label="Fat"
                    unit="g"
                    value={(item.nutritional_info.fat * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                  <NutritionalInfo
                    label="Carbs"
                    unit="g"
                    value={(item.nutritional_info.carbs * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                  <NutritionalInfo
                    label="Fiber"
                    unit="g"
                    value={(item.nutritional_info.fiber * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                  <NutritionalInfo
                    label="Sodium"
                    unit="mg"
                    value={(item.nutritional_info.sodium * servings).toString()}
                    onChange={() => {}}
                    readOnly={true}
                  />
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </div>{" "}
    </Dialog>
  );
}
