"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Recipe, Combo } from "@/lib/types";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: (v: boolean) => void;
  item: Recipe | Combo | null;
  isComboMode: boolean;
};

export default function ViewRecipePopUp({ open, onClose, item, isComboMode }: Props) {
  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* backdrop */}
      <DialogBackdrop className="fixed inset-0 bg-black/40" />

      {/* container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
            {/* title */}
            <DialogTitle className="text-xl font-bold mb-4">{item.name}</DialogTitle>

            {/* image */}
            {"imageUrl" in item && item.imageUrl && (
              <div className="mb-4">
                <Image src={item.imageUrl} alt="" className="w-full max-h-64 object-cover rounded" />
              </div>
            )}

            {/* basic info */}
            <div className="mb-4 space-y-1">
              {"serving" in item && <p>Serving: {item.serving}</p>}

              {"tags" in item && item.tags && <p>Tags: {item.tags.join(", ")}</p>}

              {"filters" in item && item.filters && <p>Filters: {item.filters.join(", ")}</p>}

              {"allergens" in item && item.allergens && <p>Allergens: {item.allergens.join(", ")}</p>}
            </div>

            {/* ingredients (recipe) */}
            {"ingredients" in item && item.ingredients && (
              <div className="mb-4">
                <h3 className="font-semibold">Ingredients</h3>

                <ul className="list-disc pl-5">
                  {item.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.name} — {ing.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {"sides" in item && item.sides && (
              <div className="mb-4">
                <h3 className="font-semibold">Sides</h3>

                <ul className="list-disc pl-5">
                  {item.sides.map((s, i) => (
                    <li key={i}>
                      {s.name} — {s.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* combo fruits */}
            {"fruits" in item && item.fruits && (
              <div className="mb-4">
                <h3 className="font-semibold">Fruits</h3>

                <ul className="list-disc pl-5">
                  {item.fruits.map((f, i) => (
                    <li key={i}>
                      {f.name} — {f.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* instructions */}
            {"instructions" in item && item.instructions && (
              <div className="mb-4">
                <h3 className="font-semibold">Instructions</h3>
                <p className="whitespace-pre-wrap">{item.instructions}</p>
              </div>
            )}

            {/* comments */}
            {"comments" in item && item.comments && (
              <div className="mb-4">
                <h3 className="font-semibold">Comments</h3>
                <p>{item.comments}</p>
              </div>
            )}

            {/* notes (combo) */}
            {"notes" in item && item.notes && (
              <div className="mb-4">
                <h3 className="font-semibold">Notes</h3>
                <p>{item.notes}</p>
              </div>
            )}

            {/* footer */}
            <div className="mt-6 flex justify-end">
              <button onClick={() => onClose(false)} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
