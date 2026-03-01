"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import type { LucideIcon } from "lucide-react";

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

export default function CreateRecipePopUp({ open, onClose, recipeType }: Props) {
  const Icon = recipeType?.icon;

  const [title, setTitle] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);
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
    setNutrition({ calories: "", protein: "", fat: "", carbs: "", fiber: "", sodium: "" });
    setId(null);
    setBusy(null);
  }, [open]);

  const payload = {
    _id: crypto.randomUUID(),
    name: title.trim(),
    isDraft: true,
    tags: [],
    imageUrl: null,
    instructions: "",
    comments: "",
  };

  async function publish() {
    if (!title.trim()) return;
    setBusy("publish");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Publish failed (${res.status})`);
      const created = await res.json().catch(() => ({}));
      setId(created?.id ?? created?.recipe?.id ?? null);
      onClose();
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
          className="w-full max-w-3xl rounded-lg bg-white p-6 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            {Icon && <Icon size={28} />}
            <h2 className="text-xl font-montserrat font-semibold text-pepper">
              Create {recipeType?.label ?? "Recipe"}
            </h2>
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
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={trash}
              disabled={!id || busy !== null}
              className={[
                "rounded-md border px-3 py-2 font-montserrat font-semibold",
                id && !busy ? "border-red-600 text-red-700 hover:bg-red-50" : "border-pepper/20 text-pepper/30",
              ].join(" ")}
              title={id ? "Delete recipe" : "Delete available after publish"}
            >
              {busy === "delete" ? "Deleting…" : "🗑️"}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy !== null}
                className="rounded-md border border-pepper/20 px-4 py-2 font-montserrat font-semibold text-pepper hover:bg-pepper/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={publish}
                disabled={!title.trim() || busy !== null}
                className="rounded-md bg-pepper px-4 py-2 font-montserrat font-semibold text-white hover:opacity-95 disabled:opacity-50"
              >
                {busy === "publish" ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
