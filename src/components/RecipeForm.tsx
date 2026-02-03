"use client";

import { useState } from "react";

type Ingredient = {
  name: string;
  quantity: string;
};

export default function RecipeForm() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "" }]);

  function addIngredient() {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  }

  function handleIngredientChange(index: number, field: keyof Ingredient, value: string) {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const recipe = {
      _id: formData.get("_id"),
      name: formData.get("name"),
      serving: Number(formData.get("serving")),
      tags: formData
        .get("tags")
        ?.toString()
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      ingredients,
      instructions: formData.get("instructions"),
      comments: formData.get("comments"),
      verifiedBy: formData.get("verifiedBy"),
      lastVerified: formData.get("lastVerified") ? new Date(formData.get("lastVerified") as string) : undefined,
    };

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });

    if (!res.ok) {
      alert("Failed to create recipe");
      return;
    }

    alert("Recipe created successfully");
    e.currentTarget.reset();
    setIngredients([{ name: "", quantity: "" }]);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Recipe</h2>

      <input name="_id" placeholder="Recipe ID" required />
      <input name="name" placeholder="Recipe Name" required />
      <input name="serving" type="number" placeholder="Number of Servings" required />
      <input name="tags" placeholder="Tags (comma separated)" />

      <h3>Ingredients</h3>
      {ingredients.map((ingredient, index) => (
        <div key={index}>
          <input
            placeholder="Ingredient Name"
            value={ingredient.name}
            onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
            required
          />
          <input
            placeholder="Quantity"
            value={ingredient.quantity}
            onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
            required
          />
        </div>
      ))}

      <button type="button" onClick={addIngredient}>
        Add Ingredient
      </button>

      <textarea name="instructions" placeholder="Instructions" />
      <textarea name="comments" placeholder="Comments" />
      <input name="verifiedBy" placeholder="Verified By" />
      <input name="lastVerified" type="date" />

      <button type="submit">Create Recipe</button>
    </form>
  );
}
