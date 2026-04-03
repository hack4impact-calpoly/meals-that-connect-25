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
  type LucideIcon,
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import type { Recipe } from "@/lib/types";
import { FILTER_SECTIONS } from "./FilterMenu";

export type CreateRecipeType = { id: string; label: string; icon: LucideIcon };
type Props = { open: boolean; onClose: () => void; recipeType: CreateRecipeType | null };

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
  options: string[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
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
                  key={option}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-montserrat text-left transition ${
                    selectedValues.includes(option)
                      ? "bg-pepper/10 text-pepper font-semibold"
                      : "text-pepper/70 hover:bg-pepper/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => {}}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateRecipePopUp({ open, onClose, recipeType }: Props) {
  const Icon = recipeType?.icon;
  const createLabel = recipeType?.label?.replace(/^Add\s+/i, "") ?? "Recipe";
  const isCombo = recipeType?.id === "combo";
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedFruit, setSelectedFruit] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [sideOptions, setSideOptions] = useState<string[]>([]);
  const [fruitOptions, setFruitOptions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const filterOptions = FILTER_SECTIONS.filter((section) => section.id !== "allergens").flatMap((section) =>
    section.options.map((option) => option.label),
  );
  const allergenOptions = FILTER_SECTIONS.filter((section) => section.id == "allergens").flatMap((section) =>
    section.options.map((option) => option.label),
  );

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);
  const [notes, setNotes] = useState("");
  const [servings, setServings] = useState("1");
  const [ingredientsText, setIngredientsText] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [nutrition, setNutrition] = useState({
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    fiber: "",
    sodium: "",
  });

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setSelectedSides([]);
    setSelectedFruit([]);
    setSelectedFilters([]);
    setSelectedAllergens([]);
    setNotes("");
    setServings("1");
    setIngredientsText("");
    setInstructionsText("");
    setNutrition({ calories: "", protein: "", fat: "", carbs: "", fiber: "", sodium: "" });
    setId(null);
    setBusy(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function loadRecipeOptions() {
      setLoadingOptions(true);

      try {
        const buildUrl = (category: "side" | "fruit") => {
          const params = new URLSearchParams({
            categories: category,
            isDraft: "false",
            page: "1",
            limit: "200",
          });

          return `/api/recipes?${params.toString()}`;
        };

        const [sideRes, fruitRes] = await Promise.all([
          fetch(buildUrl("side"), { signal: controller.signal }),
          fetch(buildUrl("fruit"), { signal: controller.signal }),
        ]);

        if (!sideRes.ok || !fruitRes.ok) {
          throw new Error("Failed to load recipe options");
        }

        const [sideJson, fruitJson]: [{ data?: Recipe[] }, { data?: Recipe[] }] = await Promise.all([
          sideRes.json(),
          fruitRes.json(),
        ]);

        const toOptionNames = (recipes: Recipe[] = []) =>
          Array.from(new Set(recipes.map((recipe) => recipe.name.trim()).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b),
          );

        setSideOptions(toOptionNames(sideJson.data));
        setFruitOptions(toOptionNames(fruitJson.data));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Failed to load side/fruit recipe options", error);
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
    if (!isDraft && !title.trim()) return;

    const ingredientLines = ingredientsText
      .split(/[\r\n,]+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const tags = [recipeType?.id, ...selectedFilters, ...selectedSides, ...selectedFruit, ...selectedAllergens]
      .filter((tag): tag is string => Boolean(tag))
      .map((tag) => tag.trim().toLowerCase());

    const payload = {
      _id: crypto.randomUUID(),
      name: title.trim() || (isDraft ? "Untitled Draft" : ""),
      isDraft,
      tags: Array.from(new Set(tags)),
      serving: Number(servings) || 1,
      ingredients:
        ingredientLines.length > 0
          ? ingredientLines.map((name) => ({ name, quantity: "1" }))
          : [{ name: "Ingredient", quantity: "1" }],
      instructions: instructionsText,
      comments: notes,
      ...(imageUrl ? { imageUrl } : {}),
    };

    setBusy("publish");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      await res.json().catch(() => ({}));
      setId(payload._id);
    } finally {
      setBusy(null);
    }
  }

  async function trash() {
    if (!id) return;
    if (!window.confirm("Delete this recipe?")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/recipes/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      onClose();
    } finally {
      setBusy(null);
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
              <button
                type="button"
                onClick={trash}
                disabled={!id || busy !== null}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
                title={id ? "Delete recipe" : "Delete available after publish"}
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm font-montserrat font-semibold uppercase tracking-[0.2em] text-pepper/60">
                  Create Recipe
                </p>
                <h2 className="text-2xl font-montserrat font-semibold text-pepper">
                  New {recipeType?.label ?? "Recipe"}
                </h2>
              </div>
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
                disabled={busy !== null || !title.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-radish-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-radish-800 disabled:opacity-50"
              >
                {busy === "publish" ? "Saving…" : "Publish"}
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-6 rounded-[32px] border-2 border-dashed border-pepper/30 bg-pepper/5 px-6 py-10 text-center text-pepper">
            <div className="mx-auto max-w-xs text-center">
              <ImageUploader onUpload={(url) => setImageUrl(url)} />
            </div>
          </div>

          {/* Title */}
          <div className="mt-5">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-montserrat font-semibold text-pepper">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chicken Alfredo"
                className="w-full rounded-md border border-pepper/20 px-3 py-2 font-montserrat text-pepper outline-none focus:border-pepper/50"
              />
            </label>
          </div>

          <div className="mt-6 rounded-[32px] border border-pepper/20 bg-white p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pepper/50">New {createLabel}</p>
            </div>
            <div className="space-y-3">
              {isCombo && (
                <>
                  <DropdownField
                    icon={Carrot}
                    label="Sides"
                    options={sideOptions}
                    selectedValues={selectedSides}
                    onSelect={(value) => {
                      setSelectedSides(
                        selectedSides.includes(value)
                          ? selectedSides.filter((s) => s !== value)
                          : [...selectedSides, value],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading sides..." : "Select sides"}
                  />
                  <DropdownField
                    icon={Apple}
                    label="Fruit"
                    options={fruitOptions}
                    selectedValues={selectedFruit}
                    onSelect={(value) => {
                      setSelectedFruit(
                        selectedFruit.includes(value)
                          ? selectedFruit.filter((f) => f !== value)
                          : [...selectedFruit, value],
                      );
                    }}
                    placeholder={loadingOptions ? "Loading fruit..." : "Select fruit"}
                  />
                </>
              )}
              <FieldRow
                icon={Tag}
                label="Filters"
                value={selectedFilters.join(", ")}
                placeholder="Enter filters"
                onChange={(value) => setSelectedFilters(value.trim() ? [value] : [])}
              />
              <DropdownField
                icon={CircleAlert}
                label="Allergens"
                options={allergenOptions}
                selectedValues={selectedAllergens}
                onSelect={(value) => {
                  setSelectedAllergens(
                    selectedAllergens.includes(value)
                      ? selectedAllergens.filter((a) => a !== value)
                      : [...selectedAllergens, value],
                  );
                }}
                placeholder="Select allergens"
              />
              <FieldRow icon={AlignLeft} label="Notes" value={notes} placeholder="Add notes" onChange={setNotes} />
            </div>
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

            <div className="space-y-3">
              <div className="text-sm font-semibold text-pepper">Ingredients</div>
              <textarea
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="List ingredients here"
                rows={3}
                className="min-h-[96px] w-full rounded-2xl border border-pepper/20 bg-slate-50 px-3 py-3 text-sm font-montserrat text-pepper outline-none focus:border-pepper/50"
              />
              <div className="h-px bg-pepper/10" />
            </div>

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

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy !== null}
              className="rounded-full border border-pepper/20 px-5 py-3 font-montserrat font-semibold text-pepper hover:bg-pepper/5 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
