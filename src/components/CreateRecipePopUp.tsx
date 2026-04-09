"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  AlignLeft,
  Apple,
  Carrot,
  ChevronDown,
  CircleAlert,
  Minus,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Recipe, Combo, RecipeReference, Ingredient } from "@/lib/types";
import { FILTER_SECTIONS } from "./FilterMenu";
import Image from "next/image";

export type CreateRecipeType = { id: string; label: string; icon: LucideIcon };
type Props = {
  item: Recipe | Combo | null;
  open: boolean;
  onClose: () => void;
  recipeType: CreateRecipeType | null;
  editMode: boolean;
};

type InputPair = {
  name: string;
  quantity: number | "";
  units: string;
};

function NutritionalInfo({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-[92px] rounded-lg border border-pepper/20 bg-white px-2 py-2">
      {/* top row: value + unit */}
      <div className="flex items-center justify-center gap-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="--"
          className="w-8 bg-transparent text-center text-sm font-montserrat font-semibold text-pepper outline-none"
        />
        <span className="text-sm font-montserrat font-semibold text-pepper/70">{unit}</span>
      </div>

      {/* bottom row: label */}
      <div className="mt-1 text-center text-xs font-montserrat font-semibold text-pepper/80">{label}</div>
    </div>
  );
}

function FieldRow({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-pepper/20 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3 text-sm font-semibold text-pepper">
        <Icon className="h-5 w-5 text-pepper" strokeWidth={2.2} />
        <span>{label}</span>
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-pepper/20 bg-white px-3 py-2 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
      />
    </label>
  );
}

function DropdownField({
  icon: Icon,
  label,
  options,
  selectedValues,
  onSelect,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  options: { id: string; name: string }[];
  selectedValues: string[];
  onSelect: (option: { id: string; name: string }) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // close automatically when outside container is clicked on
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-pepper/20 bg-slate-50 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-pepper" strokeWidth={2.2} />
          <span className="text-sm font-semibold text-pepper">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-pepper/60">
            {selectedValues.length > 0 ? selectedValues.join(", ") : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-pepper transition-transform ${isOpen ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-pepper/20 bg-white shadow-lg z-10">
          <div className="p-2">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-pepper/60">{placeholder}</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-montserrat text-left transition ${
                    selectedValues.includes(option.name)
                      ? "bg-pepper/10 text-pepper font-semibold"
                      : "text-pepper/70 hover:bg-pepper/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.name)}
                    onChange={() => {}}
                    className="h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(option);
                    }}
                  />
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateRecipePopUp({ item, open, onClose, recipeType, editMode }: Props) {
  const createLabel = recipeType?.label?.replace(/^Add\s+/i, "") ?? "Recipe";
  const isCombo = recipeType?.id === "Combo";
  const [selectedSides, setSelectedSides] = useState<RecipeReference[]>([]);
  const [selectedFruits, setSelectedFruit] = useState<RecipeReference[]>([]);
  const [selectedEntrees, setSelectedEntree] = useState<RecipeReference[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<RecipeReference[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<RecipeReference[]>([]);
  const [entreeOptions, setEntreeOptions] = useState<{ id: string; name: string }[]>([]);
  const [sideOptions, setSideOptions] = useState<{ id: string; name: string }[]>([]);
  const [fruitOptions, setFruitOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const filterOptions = FILTER_SECTIONS.filter((section) => section.id !== "allergens").flatMap((section) =>
    section.options.map((option) => ({
      name: option.label,
      id: option.label,
    })),
  );
  const allergenOptions = FILTER_SECTIONS.filter((section) => section.id == "allergens").flatMap((section) =>
    section.options.map((option) => ({
      name: option.label,
      id: option.label,
    })),
  );

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);
  const [notes, setNotes] = useState("");
  const [servings, setServings] = useState("1");
  const [instructionsText, setInstructionsText] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    fiber: "",
    sodium: "",
  });

  const [ingredientInputs, setIngredientInputs] = useState<InputPair[]>([{ name: "", quantity: "", units: "" }]);

  // handle ingredient name change
  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredientInputs];
    updated[index].name = value;
    setIngredientInputs(updated);
  };

  // handle quantity change
  const handleQuantityChange = (index: number, value: string) => {
    const updated = [...ingredientInputs];

    // convert to number
    updated[index].quantity = value === "" ? "" : Number(value);

    setIngredientInputs(updated);
  };

  // handle units change
  const handleUnitsChange = (index: number, value: string) => {
    const updated = [...ingredientInputs];
    updated[index].units = value;
    setIngredientInputs(updated);
  };

  // adding new row
  const addRow = () => {
    setIngredientInputs([...ingredientInputs, { name: "", quantity: "", units: "" }]);
  };

  // removing row
  const removeRow = (index: number) => {
    const updated = ingredientInputs.filter((_, i) => i !== index);
    setIngredientInputs(updated);
  };

  const isRecipe = (item: Recipe | Combo): item is Recipe => {
    return "ingredients" in item;
  };

  useEffect(() => {
    if (!open) return;

    if (item == null) {
      setName("");
      setIngredientInputs([{ name: "", quantity: "", units: "" }]);
      setSelectedSides([]);
      setSelectedFruit([]);
      setSelectedEntree([]);
      setSelectedFilters([]);
      setSelectedAllergens([]);
      setNotes("");
      setServings("1");
      setInstructionsText("");
      setNutrition({ calories: "", protein: "", fat: "", carbs: "", fiber: "", sodium: "" });
      setId(null);
      setBusy(null);
    } else {
      setName(item.name);
      setServings(item.serving.toString());
      setSelectedAllergens(
        (item.allergens ?? []).map((f) => ({
          id: f.trim(),
          name: f.trim(),
        })),
      );
      setSelectedFilters(
        (item.filters ?? []).map((f) => ({
          id: f.trim(),
          name: f.trim(),
        })),
      );
      setInstructionsText(item.instructions ?? "");
      setNotes(item.notes ?? "");
      setImageUrl(item.imageUrl ?? "");

      if (!item) return;

      // if it's entree/side/fruit
      if (!isCombo && isRecipe(item) === true) {
        setIngredientInputs(
          item.ingredients
            ? item.ingredients.map((ingredient: Ingredient) => ({
                name: ingredient.name,
                quantity: ingredient.quantity,
                units: ingredient.units,
              }))
            : [],
        );

        setNutrition({
          calories: item.nutritional_info.calories.toString(),
          protein: item.nutritional_info.protein.toString(),
          fat: item.nutritional_info.fat.toString(),
          carbs: item.nutritional_info.carbs.toString(),
          fiber: item.nutritional_info.fiber.toString(),
          sodium: item.nutritional_info.sodium.toString(),
        });
      } else if (isCombo && isRecipe(item) === false) {
        setSelectedSides(item.sides ?? []);
        setSelectedFruit(item.fruits ?? []);
        setSelectedEntree(item.entrees ?? []);
      }

      setId(item._id);
      setBusy(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function loadRecipeOptions() {
      setLoadingOptions(true);

      try {
        const buildUrl = (category: "entree" | "side" | "fruit") => {
          const params = new URLSearchParams({
            categories: category,
            isDraft: "false",
            page: "1",
            limit: "200",
          });

          return `/api/recipes?${params.toString()}`;
        };

        const [entreeRes, sideRes, fruitRes] = await Promise.all([
          fetch(buildUrl("entree"), { signal: controller.signal }),
          fetch(buildUrl("side"), { signal: controller.signal }),
          fetch(buildUrl("fruit"), { signal: controller.signal }),
        ]);

        if (!entreeRes.ok || !sideRes.ok || !fruitRes.ok) {
          throw new Error("Failed to load recipe options");
        }

        const [entreeJson, sideJson, fruitJson]: [{ data?: Recipe[] }, { data?: Recipe[] }, { data?: Recipe[] }] =
          await Promise.all([entreeRes.json(), sideRes.json(), fruitRes.json()]);

        const toOptionNames = (recipes: Recipe[] = []) =>
          /*Array.from(new Set(recipes.map((recipe) => recipe.name.trim()).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b),
          );*/
          Array.from(new Map(recipes.map((r) => [r.name.trim(), { id: r._id, name: r.name.trim() }])).values()).sort(
            (a, b) => a.name.localeCompare(b.name),
          );

        setEntreeOptions(toOptionNames(entreeJson.data));
        setSideOptions(toOptionNames(sideJson.data));
        setFruitOptions(toOptionNames(fruitJson.data));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load side/fruit recipe options", error);
        setEntreeOptions([]);
        setSideOptions([]);
        setFruitOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadRecipeOptions();

    return () => controller.abort();
  }, [open]);

  async function saveRecipe(isDraft: boolean) {
    if (!isDraft && !name.trim()) return;

    const tags = [recipeType?.id, ...selectedFilters.map((f) => f.name)]
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1).toLowerCase());

    let payload;

    setBusy("publish");

    try {
      let res;
      // check if it's recipe or combo
      if (isCombo) {
        payload = {
          _id: crypto.randomUUID(),
          name: name.trim() || (isDraft ? "Untitled Draft" : ""),
          serving: Number(servings) || 1,
          entrees: selectedEntrees.map((entree) => ({ name: entree.name, id: entree.id })),
          sides: selectedSides.map((side) => ({ name: side.name, id: side.id })),
          fruits: selectedFruits.map((fruit) => ({ name: fruit.name, id: fruit.id })),
          filters: Array.from(new Set(tags)),
          notes: notes,
          allergens: selectedAllergens.map((allergen) => allergen.name),
          instructions: instructionsText,
          isDraft,
          ...(imageUrl ? { imageUrl } : {}),
        };

        if (editMode === false) {
          res = await fetch("/api/combos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else if (item && "_id" in item) {
          // change to our id
          payload["_id"] = item._id;
          res = await fetch(`/api/combos/${item._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } else {
        payload = {
          _id: crypto.randomUUID(),
          name: name.trim() || (isDraft ? "Untitled Draft" : ""),
          serving: Number(servings) || 1,
          allergens: selectedAllergens.map((allergen) => allergen.name),
          filters: Array.from(new Set(tags)),
          ingredients:
            ingredientInputs.length > 0
              ? ingredientInputs
                  .filter(
                    (ingredient) =>
                      ingredient.name.trim() !== "" || ingredient.quantity !== "" || ingredient.units.trim() !== "",
                  )
                  .map((ingredient) => ({
                    name: ingredient.name,
                    quantity: ingredient.quantity !== "" ? Number(ingredient.quantity) : undefined,
                    units: ingredient.units,
                  }))
              : undefined,
          instructions: instructionsText,
          notes: notes,
          isDraft,
          nutritional_info: {
            calories: nutrition.calories !== "" ? Number(nutrition.calories) : 0,
            protein: nutrition.protein !== "" ? Number(nutrition.protein) : 0,
            fat: nutrition.fat !== "" ? Number(nutrition.fat) : 0,
            carbs: nutrition.carbs !== "" ? Number(nutrition.carbs) : 0,
            fiber: nutrition.fiber !== "" ? Number(nutrition.fiber) : 0,
            sodium: nutrition.sodium !== "" ? Number(nutrition.sodium) : 0,
          },
          ...(imageUrl ? { imageUrl } : {}),
        };
        console.log("Payload:", payload);

        if (editMode === false) {
          res = await fetch("/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`Save failed (${res.status})`);
          await res.json().catch(() => ({}));
        } else if (item && "_id" in item) {
          // change to our id
          payload["_id"] = item._id;
          res = await fetch(`/api/recipes/${item._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`Save failed (${res.status})`);
          await res.json().catch(() => ({}));
        }
      }

      setId(payload._id);
    } finally {
      setBusy(null);

      // close window
      onClose();

      // reload window
      window.location.reload();
    }
  }

  async function trash() {
    if (!id) return;
    if (!window.confirm("Delete this item?")) return;
    setBusy("delete");
    try {
      let res;
      if (isCombo) {
        res = await fetch(`/api/combos/${encodeURIComponent(id)}`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      onClose();
    } finally {
      setBusy(null);

      // reload window
      window.location.reload();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
        >
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* only show trash option if we are editing */}
              {editMode === true && (
                <button
                  type="button"
                  onClick={trash}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
                  title={id ? "Delete recipe" : "Delete available after publish"}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => saveRecipe(true)}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 rounded-full border border-radish-200 bg-white px-4 py-2 text-sm font-semibold text-radish-900 transition hover:bg-radish-100 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => saveRecipe(false)}
                disabled={busy !== null || !name.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-radish-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-radish-800 disabled:opacity-50"
              >
                {busy === "publish" ? "Saving…" : "Publish"}
              </button>
            </div>
          </div>

          {/* Image Upload */}
          {imageUrl ? (
            <div className="mt-6 rounded-[32px] border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
              <div className="mx-auto max-w-xs text-center">
                <Image
                  src={imageUrl}
                  alt="Uploaded"
                  width={200}
                  height={200}
                  className="mx-auto mb-4 max-h-48 rounded-xl object-cover"
                />
                <button onClick={() => setImageUrl("")} className="text-sm text-blue-500">
                  Replace image
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[32px] border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
              <div className="mx-auto max-w-xs text-center">
                <ImageUploader onUpload={(url) => setImageUrl(url)} />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mt-5">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-montserrat font-semibold text-pepper">New {createLabel}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chicken Alfredo"
                className="w-full rounded-md border border-pepper/20 px-3 py-2 font-montserrat text-pepper outline-none focus:border-pepper/50"
              />
            </label>
          </div>

          <div className="space-y-3 mt-5">
            {isCombo && (
              <>
                <DropdownField
                  icon={Carrot}
                  label="Entree"
                  options={entreeOptions}
                  selectedValues={selectedEntrees.map((f) => f.name)}
                  onSelect={(value) => {
                    const selectedOption = entreeOptions.find((e) => e.name === value.name);

                    if (!selectedOption) return;

                    setSelectedEntree((prev) =>
                      prev.some((e) => e.id === selectedOption.id)
                        ? prev.filter((e) => e.id !== selectedOption.id)
                        : [...prev, selectedOption],
                    );
                  }}
                  placeholder={loadingOptions ? "Loading sides..." : "Select Entree(s)"}
                />
                <DropdownField
                  icon={Carrot}
                  label="Sides"
                  options={sideOptions}
                  selectedValues={selectedSides.map((f) => f.name)}
                  onSelect={(value) => {
                    const selectedOption = sideOptions.find((e) => e.name === value.name);

                    if (!selectedOption) return;

                    setSelectedSides((prev) =>
                      prev.some((e) => e.id === selectedOption.id)
                        ? prev.filter((e) => e.id !== selectedOption.id)
                        : [...prev, selectedOption],
                    );
                  }}
                  placeholder={loadingOptions ? "Loading sides..." : "Select Side(s)"}
                />
                <DropdownField
                  icon={Apple}
                  label="Fruit"
                  options={fruitOptions}
                  selectedValues={selectedFruits.map((f) => f.name)}
                  onSelect={(value) => {
                    const selectedOption = fruitOptions.find((e) => e.name === value.name);

                    if (!selectedOption) return;

                    setSelectedFruit((prev) =>
                      prev.some((e) => e.id === selectedOption.id)
                        ? prev.filter((e) => e.id !== selectedOption.id)
                        : [...prev, selectedOption],
                    );
                  }}
                  placeholder={loadingOptions ? "Loading fruit..." : "Select Fruit(s)"}
                />
              </>
            )}
            <DropdownField
              icon={Tag}
              label="Filters"
              options={filterOptions}
              selectedValues={selectedFilters.map((f) => f.name)}
              onSelect={(value) => {
                setSelectedFilters((prev) =>
                  prev.some((a) => a.id === value.id) ? prev.filter((a) => a.id !== value.id) : [...prev, value],
                );
              }}
              placeholder="Select Filter(s)"
            />
            <DropdownField
              icon={CircleAlert}
              label="Allergens"
              options={allergenOptions}
              selectedValues={selectedAllergens.map((f) => f.name)}
              onSelect={(value) => {
                setSelectedAllergens((prev) =>
                  prev.some((a) => a.id === value.id) ? prev.filter((a) => a.id !== value.id) : [...prev, value],
                );
              }}
              placeholder="Select Allergen(s)"
            />
            <FieldRow icon={AlignLeft} label="Notes" value={notes} placeholder="Add notes" onChange={setNotes} />
          </div>

          <div className="my-6 h-px bg-pepper/10" />

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-pepper">Servings</div>
              <div className="inline-flex items-center gap-3 rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3">
                <button
                  type="button"
                  onClick={() => setServings((prev) => String(Math.max(1, Number(prev) - 1) || 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-pepper/20 bg-white text-pepper transition hover:bg-pepper/5"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[24px] text-center text-xl font-semibold text-pepper">{servings || "1"}</span>
                <button
                  type="button"
                  onClick={() => setServings((prev) => String((Number(prev) || 1) + 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-pepper/20 bg-white text-pepper transition hover:bg-pepper/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="h-px bg-pepper/10" />
            </div>

            {!isCombo && (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-pepper">Ingredients</div>
                <div className="pt-6 pb-6 bg-white rounded-2xl">
                  <div className="flex flex-col gap-2">
                    {ingredientInputs.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Enter Ingredient Name"
                          value={item.name}
                          onChange={(e) => handleIngredientChange(index, e.target.value)}
                          className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <input
                          type="number"
                          placeholder="Enter Number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <input
                          type="text"
                          placeholder="Enter Units"
                          value={item.units}
                          onChange={(e) => handleUnitsChange(index, e.target.value)}
                          className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <button
                          onClick={() => removeRow(index)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-4xl text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={addRow}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div className="h-px bg-pepper/10" />
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-semibold text-pepper">Instructions</div>
              <textarea
                value={instructionsText}
                onChange={(e) => setInstructionsText(e.target.value)}
                placeholder="List instructions here"
                rows={3}
                className="min-h-[96px] w-full rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
              />
            </div>
          </div>

          {/* Nutritional Info */}
          {!isCombo && (
            <div className="mt-6">
              <h3 className="text-base font-montserrat font-semibold text-pepper">Nutritional Information</h3>

              <div className="mt-3 flex flex-wrap gap-3">
                <NutritionalInfo
                  label="Calories"
                  unit="kcal"
                  value={nutrition.calories}
                  onChange={(v) => setNutrition((n) => ({ ...n, calories: v }))}
                />
                <NutritionalInfo
                  label="Protein"
                  unit="g"
                  value={nutrition.protein}
                  onChange={(v) => setNutrition((n) => ({ ...n, protein: v }))}
                />
                <NutritionalInfo
                  label="Fat"
                  unit="g"
                  value={nutrition.fat}
                  onChange={(v) => setNutrition((n) => ({ ...n, fat: v }))}
                />
                <NutritionalInfo
                  label="Carb"
                  unit="g"
                  value={nutrition.carbs}
                  onChange={(v) => setNutrition((n) => ({ ...n, carbs: v }))}
                />
                <NutritionalInfo
                  label="Fiber"
                  unit="g"
                  value={nutrition.fiber}
                  onChange={(v) => setNutrition((n) => ({ ...n, fiber: v }))}
                />
                <NutritionalInfo
                  label="Sodium"
                  unit="mg"
                  value={nutrition.sodium}
                  onChange={(v) => setNutrition((n) => ({ ...n, sodium: v }))}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          {/*<div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy !== null}
              className="rounded-full border border-pepper/20 px-5 py-3 font-montserrat font-semibold text-pepper hover:bg-pepper/5 disabled:opacity-50"
            >
              Close
            </button>
          </div>*/}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
