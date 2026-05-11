import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { AlignLeft, ChefHat, ChevronDown, Minus, Plus, Save, Trash2, X, type LucideIcon } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import {
  FILTER_SECTIONS,
  ENTREE_ICON,
  VEGETABLE_ICON,
  FRUIT_ICON,
  GRAIN_ICON,
  FILTER_ICON,
  ALLERGEN_ICON,
  DIETARY_KEYS,
  EXCLUSION_KEYS,
} from "@/lib/types";
import type {
  Recipe,
  Combo,
  Ingredient,
  RecipeMinimal,
  RecipeCategory,
  CategoryDisplayType,
  DietaryKey,
  ExclusionKey,
  FilterOption,
  ProteinSource,
  FilterOptionId,
  FilterSectionId,
} from "@/lib/types";
import Image from "next/image";
import { NutritionalInfo } from "./createRecipe/NutritionalInfo";
import { FieldRow } from "./createRecipe/FieldRow";
import { DropdownField } from "./createRecipe/DropdownField";

// TODO: this whole thing should be split into Create Combo / Create Recipe subcomponents and helpers should be moved to helpers.ts

type EditableCombo = Combo<Recipe>;
type EditableItem = Recipe | EditableCombo;

type Props = {
  item: EditableItem | null;
  open: boolean;
  onClose: () => void;
  recipeType: CategoryDisplayType | null;
  editMode: boolean;
};

type InputPair = {
  name: string;
  quantity: number | "";
  units: string;
};

function isRecipeItem(item: EditableItem): item is Recipe {
  return "category" in item;
}

function toRecipeMinimal(recipes: Recipe[] = []): RecipeMinimal[] {
  return recipes.map((recipe) => ({
    _id: recipe._id,
    name: recipe.name,
  }));
}

function comboHasRecipe(combo: Combo, recipeId: string) {
  return (
    combo.entrees?.includes(recipeId) ||
    combo.vegetables?.includes(recipeId) ||
    combo.fruits?.includes(recipeId) ||
    combo.grains?.includes(recipeId)
  );
}

function getFilterSectionOptions(sectionId: FilterSectionId): FilterOption[] {
  const section = FILTER_SECTIONS.find((section) => section.id === sectionId);
  return section?.options ?? [];
}

function toggleFilterOption(selectedOptions: FilterOption[], option: FilterOption): FilterOption[] {
  // check the current toggle status for this option
  const alreadySelected = selectedOptions.some((selectedOption) => selectedOption.id === option.id);

  if (alreadySelected) {
    // toggle off
    return selectedOptions.filter((selectedOption) => selectedOption.id !== option.id);
  }

  // toggle on
  return [...selectedOptions, option];
}

function optionsToBooleanFlags<TFilterKey extends FilterOptionId>(
  keys: readonly TFilterKey[],
  selectedOptions: FilterOption[],
): Record<TFilterKey, boolean> {
  const selectedIds = new Set(selectedOptions.map((option) => option.id));
  return Object.fromEntries(keys.map((key) => [key, selectedIds.has(key)])) as Record<TFilterKey, boolean>;
}

function flagsToSelectedOptions<TFilterKey extends FilterOptionId>(
  flags: Partial<Record<TFilterKey, boolean>> | undefined,
  options: FilterOption[],
): FilterOption[] {
  if (!flags) return [];

  return options.filter((option) => flags[option.id as TFilterKey]);
}

const PROTEIN_SOURCE_OPTIONS = getFilterSectionOptions("proteinSources");
const DIETARY_OPTIONS = getFilterSectionOptions("dietary");
const EXCLUSION_OPTIONS = getFilterSectionOptions("exclusions");
const IS_SUBRECIPE_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

export default function CreateRecipePopUp({ item, open, onClose, recipeType, editMode }: Props) {
  const createLabel = recipeType?.label ?? "Recipe";
  const isCombo = recipeType?.category === "Combo" || (!!item && !isRecipeItem(item));
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [selectedEntrees, setSelectedEntree] = useState<RecipeMinimal[]>([]);
  const [selectedVegetables, setSelectedVegetables] = useState<RecipeMinimal[]>([]);
  const [selectedFruits, setSelectedFruit] = useState<RecipeMinimal[]>([]);
  const [selectedGrains, setSelectedGrains] = useState<RecipeMinimal[]>([]);

  const [selectedProteinSources, setSelectedProteinSources] = useState<FilterOption[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<FilterOption[]>([]);
  const [selectedExclusions, setSelectedExclusions] = useState<FilterOption[]>([]);
  const [isSubrecipe, setIsSubrecipe] = useState(false);

  const [entreeOptions, setEntreeOptions] = useState<RecipeMinimal[]>([]);
  const [vegetableOptions, setVegetableOptions] = useState<RecipeMinimal[]>([]);
  const [fruitOptions, setFruitOptions] = useState<RecipeMinimal[]>([]);
  const [grainOptions, setGrainOptions] = useState<RecipeMinimal[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  useEffect(() => {
    if (!open) return;

    if (item == null) {
      setName("");
      setIngredientInputs([{ name: "", quantity: "", units: "" }]);
      setSelectedEntree([]);
      setSelectedVegetables([]);
      setSelectedFruit([]);
      setSelectedGrains([]);
      setSelectedProteinSources([]);
      setSelectedDietary([]);
      setSelectedExclusions([]);
      setImageUrl("");
      setIsSubrecipe(false);
      setNotes("");
      setServings("1");
      setInstructionsText("");
      setNutrition({ calories: "", protein: "", fat: "", carbs: "", fiber: "", sodium: "" });
      setId(null);
      setBusy(null);
    } else {
      setName(item.name);
      setServings(item.serving.toString());
      setInstructionsText(item.instructions ?? "");
      setNotes(item.notes ?? "");
      setImageUrl(item.imageUrl ?? "");

      if (!item) return;

      // if it's a recipe
      if (!isCombo && isRecipeItem(item) === true) {
        setSelectedProteinSources(
          PROTEIN_SOURCE_OPTIONS.filter((option) => item.proteinSources?.includes(option.id as ProteinSource)),
        );

        setSelectedDietary(flagsToSelectedOptions<DietaryKey>(item.dietary, DIETARY_OPTIONS));

        setSelectedExclusions(flagsToSelectedOptions<ExclusionKey>(item.exclusions, EXCLUSION_OPTIONS));
        setIsSubrecipe(item.isSubrecipe);
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
      } else if (isCombo && !isRecipeItem(item)) {
        setSelectedEntree(toRecipeMinimal(item.entrees));
        setSelectedVegetables(toRecipeMinimal(item.vegetables));
        setSelectedFruit(toRecipeMinimal(item.fruits));
        setSelectedGrains(toRecipeMinimal(item.grains));
      }

      setId(item._id);
      setBusy(null);
    }
  }, [open, item, isCombo]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function loadRecipeOptions() {
      setLoadingOptions(true);

      try {
        const buildUrl = (category: RecipeCategory) => {
          const params = new URLSearchParams({
            categories: category,
            isDraft: "false",
            page: "1",
            limit: "200",
          });

          return `/api/recipes?${params.toString()}`;
        };

        const [entreeRes, vegetableRes, fruitRes, grainRes] = await Promise.all([
          fetch(buildUrl("Entree"), { signal: controller.signal }),
          fetch(buildUrl("Vegetable"), { signal: controller.signal }),
          fetch(buildUrl("Fruit"), { signal: controller.signal }),
          fetch(buildUrl("Grain"), { signal: controller.signal }),
        ]);

        if (!entreeRes.ok || !vegetableRes.ok || !fruitRes.ok || !grainRes.ok) {
          throw new Error("Failed to load recipe options");
        }

        const [entreeJson, vegetableJson, fruitJson, grainJson]: [
          { data?: Recipe[] },
          { data?: Recipe[] },
          { data?: Recipe[] },
          { data?: Recipe[] },
        ] = await Promise.all([entreeRes.json(), vegetableRes.json(), fruitRes.json(), grainRes.json()]);

        const toOptionNames = (recipes: Recipe[] = []) =>
          Array.from(
            new Map(
              recipes.map((recipe) => [
                recipe.name.trim(),
                {
                  _id: recipe._id,
                  name: recipe.name.trim(),
                },
              ]),
            ).values(),
          ).sort((a, b) => a.name.localeCompare(b.name));

        setEntreeOptions(toOptionNames(entreeJson.data));
        setVegetableOptions(toOptionNames(vegetableJson.data));
        setFruitOptions(toOptionNames(fruitJson.data));
        setGrainOptions(toOptionNames(grainJson.data));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load side/fruit recipe options", error);
        setEntreeOptions([]);
        setVegetableOptions([]);
        setFruitOptions([]);
        setGrainOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadRecipeOptions();

    return () => controller.abort();
  }, [open]);

  async function saveRecipe(isDraft: boolean, itemId: String | null) {
    if (!isDraft && !name.trim()) return;

    // make sure that published recipes cannot be saved as drafts IF they are being used in an existing combo
    if (!isCombo && isDraft && itemId !== "") {
      // FIXME: Shoudn't this happen server side? Due to pagination I don't think this works.
      const res = await fetch(`/api/combos`, { method: "GET" });
      if (!res.ok) {
        console.error("Failed to check recipe combos", res.status);
        alert("Failed to save recipe. Please try again.");
        return;
      }

      const json = await res.json();
      const data = json.data;

      const isUsed = data.some((combo: Combo) => id && comboHasRecipe(combo, id));

      if (isUsed === true) {
        alert("Failed to save recipe as a draft. Recipe is being used in an existing combo.");
        return;
      }
    }

    const proteinSources = selectedProteinSources.map((option) => option.id as ProteinSource);

    const dietary = optionsToBooleanFlags(DIETARY_KEYS, selectedDietary);
    const exclusions = optionsToBooleanFlags(EXCLUSION_KEYS, selectedExclusions);

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
          entrees: selectedEntrees.map((entree) => entree._id),
          vegetables: selectedVegetables.map((vegetable) => vegetable._id),
          fruits: selectedFruits.map((fruit) => fruit._id),
          grains: selectedGrains.map((grain) => grain._id),
          notes: notes,
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
        const recipeCategory =
          item && isRecipeItem(item) ? item.category : recipeType?.category !== "Combo" ? recipeType?.category : null;

        if (!recipeCategory) {
          alert("Missing recipe category.");
          return;
        }

        payload = {
          _id: crypto.randomUUID(),
          name: name.trim() || (isDraft ? "Untitled Draft" : ""),
          isSubrecipe: isSubrecipe,
          category: recipeCategory,
          serving: Number(servings) || 1,
          proteinSources: Array.from(new Set(proteinSources)),
          dietary,
          exclusions,
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

    // check if valid deletion can occur - no recipe should be able to be deleted if it's being used in an existing combo, but combos can be deleted regardless
    if (!isCombo) {
      // FIXME: we are checking client side every single combo ever created???
      // this doesn't currently work anyway due to pagination.
      const res = await fetch(`/api/combos`, { method: "GET" });
      if (!res.ok) {
        console.error("Failed to check recipe combos", res.status);
        alert("Failed to delete recipe. Please try again.");
        return;
      }

      const json = await res.json();
      const data = json.data;

      const isUsed = data.some((combo: Combo) => comboHasRecipe(combo, id));

      if (isUsed === true) {
        alert("Failed to delete. Recipe is being used in an existing combo.");
        return;
      }
    }

    setShowDeleteModal(true);
    setBusy("delete");
    try {
      let res;
      if (isCombo) {
        res = await fetch(`/api/combos/${encodeURIComponent(id)}`, { method: "DELETE" });
      } else {
        // verify we can delete this recipe as long as it's not being used in an existing combo
        res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { method: "DELETE" });
      }
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      onClose();
    } finally {
      setBusy(null);

      window.location.reload();
    }
  }

  return (
    <>
      <Dialog open={showCloseConfirm} onClose={() => setShowCloseConfirm(false)} className="relative z-[100]">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Discard changes?</h3>

            <p className="mt-2 text-sm text-gray-600">You have unsaved changes. Are you sure you want to close?</p>

            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg bg-gray-200 px-4 py-2" onClick={() => setShowCloseConfirm(false)}>
                Cancel
              </button>

              <button
                className="rounded-lg bg-radish-900 px-4 py-2 text-white"
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
              >
                Discard
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <Dialog open={open} onClose={() => setShowCloseConfirm(true)} className="relative z-50">
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
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
                    title={id ? "Delete recipe" : "Delete available after publish"}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
                  <div className="relative p-4 w-full max-w-md">
                    <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
                      {/* Close button */}
                      <button
                        type="button"
                        className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        ✕
                      </button>

                      {/* Modal content */}
                      <h3 className="text-lg font-semibold text-heading">Delete item?</h3>

                      <p className="text-sm text-body mt-2">This action cannot be undone.</p>

                      {/* Buttons */}
                      <div className="flex justify-end gap-2 mt-5">
                        <button
                          className="px-4 py-2 rounded-lg text-white bg-dark-gray hover:bg-medium-gray"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancel
                        </button>

                        <button
                          className="px-4 py-2 text-white hover:bg-radish-500 bg-radish-900 rounded-lg"
                          onClick={trash}
                          disabled={busy === "delete"}
                        >
                          {busy === "delete" ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => saveRecipe(true, item ? item._id : "")}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 rounded-full border border-radish-200 bg-white px-4 py-2 text-sm font-semibold text-radish-900 transition hover:bg-radish-100 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => saveRecipe(false, "")}
                  disabled={busy !== null || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-radish-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-radish-800 disabled:opacity-50"
                >
                  {busy === "publish" ? "Saving…" : "Publish"}
                </button>
              </div>
            </div>

            {/* Image Upload */}
            {imageUrl ? (
              <div className="mt-6 rounded-4xl border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
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
              <div className="mt-6 rounded-4xl border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
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
                    icon={ENTREE_ICON}
                    label="Entree"
                    options={entreeOptions.map((recipe) => ({ id: recipe._id, label: recipe.name }))}
                    selectedValues={selectedEntrees.map((recipe) => recipe.name)}
                    onSelect={(value) => {
                      const selectedOption = entreeOptions.find((recipe) => recipe._id === value.id);
                      if (!selectedOption) return;

                      setSelectedEntree((prev) =>
                        prev.some((recipe) => recipe._id === selectedOption._id)
                          ? prev.filter((recipe) => recipe._id !== selectedOption._id)
                          : [...prev, selectedOption],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading entrees..." : "Select Entree(s)"}
                  />

                  <DropdownField
                    icon={VEGETABLE_ICON}
                    label="Vegetables"
                    options={vegetableOptions.map((recipe) => ({ id: recipe._id, label: recipe.name }))}
                    selectedValues={selectedVegetables.map((recipe) => recipe.name)}
                    onSelect={(value) => {
                      const selectedOption = vegetableOptions.find((recipe) => recipe._id === value.id);
                      if (!selectedOption) return;

                      setSelectedVegetables((prev) =>
                        prev.some((recipe) => recipe._id === selectedOption._id)
                          ? prev.filter((recipe) => recipe._id !== selectedOption._id)
                          : [...prev, selectedOption],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading vegetables..." : "Select Vegetable(s)"}
                  />

                  <DropdownField
                    icon={FRUIT_ICON}
                    label="Fruit"
                    options={fruitOptions.map((recipe) => ({ id: recipe._id, label: recipe.name }))}
                    selectedValues={selectedFruits.map((recipe) => recipe.name)}
                    onSelect={(value) => {
                      const selectedOption = fruitOptions.find((recipe) => recipe._id === value.id);
                      if (!selectedOption) return;

                      setSelectedFruit((prev) =>
                        prev.some((recipe) => recipe._id === selectedOption._id)
                          ? prev.filter((recipe) => recipe._id !== selectedOption._id)
                          : [...prev, selectedOption],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading fruit..." : "Select Fruit(s)"}
                  />

                  <DropdownField
                    icon={GRAIN_ICON}
                    label="Grain"
                    options={grainOptions.map((recipe) => ({ id: recipe._id, label: recipe.name }))}
                    selectedValues={selectedGrains.map((recipe) => recipe.name)}
                    onSelect={(value) => {
                      const selectedOption = grainOptions.find((recipe) => recipe._id === value.id);
                      if (!selectedOption) return;

                      setSelectedGrains((prev) =>
                        prev.some((recipe) => recipe._id === selectedOption._id)
                          ? prev.filter((recipe) => recipe._id !== selectedOption._id)
                          : [...prev, selectedOption],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading grains..." : "Select Grain(s)"}
                  />
                </>
              )}

              {!isCombo && (
                <>
                  <DropdownField
                    icon={ChefHat}
                    label="Is this a Subrecipe?"
                    options={IS_SUBRECIPE_OPTIONS}
                    selectedValues={[isSubrecipe ? "Yes" : "No"]}
                    onSelect={(value) => {
                      setIsSubrecipe(value.id === "yes");
                    }}
                    placeholder="Select Yes or No"
                  />
                  <DropdownField
                    icon={FILTER_ICON}
                    label="Protein Sources"
                    options={PROTEIN_SOURCE_OPTIONS}
                    selectedValues={selectedProteinSources.map((option) => option.label)}
                    onSelect={(option) => {
                      setSelectedProteinSources((prev) => toggleFilterOption(prev, option as FilterOption));
                    }}
                    placeholder="Select Protein Source(s)"
                  />

                  <DropdownField
                    icon={FILTER_ICON}
                    label="Dietary"
                    options={DIETARY_OPTIONS}
                    selectedValues={selectedDietary.map((option) => option.label)}
                    onSelect={(option) => {
                      setSelectedDietary((prev) => toggleFilterOption(prev, option as FilterOption));
                    }}
                    placeholder="Select Dietary Option(s)"
                  />

                  <DropdownField
                    icon={ALLERGEN_ICON}
                    label="Allergens / Exclusions"
                    options={EXCLUSION_OPTIONS}
                    selectedValues={selectedExclusions.map((option) => option.label)}
                    onSelect={(option) => {
                      setSelectedExclusions((prev) => toggleFilterOption(prev, option as FilterOption));
                    }}
                    placeholder="Select Exclusion(s)"
                  />
                </>
              )}

              <FieldRow icon={AlignLeft} label="Notes" value={notes} placeholder="Add notes" onChange={setNotes} />
            </div>

            <div className="my-6 h-px bg-pepper/10" />

            <div className="space-y-6">
              {!isCombo && (
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
                    <input
                      type="number"
                      value={servings || "1"}
                      onChange={(e) => setServings(e.target.value)}
                      className="max-w-13.5 text-center text-xl font-semibold text-pepper"
                    />

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
              )}

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
                  className="min-h-24 w-full rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
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
    </>
  );
}
