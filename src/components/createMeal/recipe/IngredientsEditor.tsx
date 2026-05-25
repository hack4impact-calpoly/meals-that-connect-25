// createMeal/recipe/IngredientsEditor.tsx

import { Plus, X } from "lucide-react";
import type { InputPair } from "../types";

type IngredientsEditorProps = {
  ingredients: InputPair[];
  onChange: (ingredients: InputPair[]) => void;
};

export function IngredientsEditor({ ingredients, onChange }: IngredientsEditorProps) {
  const updateIngredient = (index: number, updates: Partial<InputPair>) => {
    onChange(
      ingredients.map((ingredient, currentIndex) =>
        currentIndex === index ? { ...ingredient, ...updates } : ingredient,
      ),
    );
  };

  const addRow = () => {
    onChange([...ingredients, { name: "", quantity: "", units: "" }]);
  };

  const removeRow = (index: number) => {
    onChange(ingredients.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-pepper">Ingredients</div>

      <div className="pt-6 pb-6 bg-white rounded-2xl">
        <div className="flex flex-col gap-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Ingredient Name"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, { name: e.target.value })}
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="number"
                placeholder="Enter Number"
                value={ingredient.quantity}
                onChange={(e) =>
                  updateIngredient(index, {
                    quantity: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                placeholder="Enter Units"
                value={ingredient.units}
                onChange={(e) => updateIngredient(index, { units: e.target.value })}
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                type="button"
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
            type="button"
            onClick={addRow}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-radish-200 bg-radish-100 text-radish-900 transition hover:bg-radish-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="h-px bg-pepper/10" />
    </div>
  );
}
