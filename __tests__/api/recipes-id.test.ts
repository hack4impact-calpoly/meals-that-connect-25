import { withMongo } from "../helpers/mongo";
import { GET, PATCH, DELETE } from "@/app/api/recipes/[id]/route";
import Recipe from "@/database/RecipeSchema";
import { makeRecipe, makeNutrition } from "../helpers/recipes";
import { NextRequest } from "next/server";

withMongo();

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatchRequest(id: string, body: any) {
  return new NextRequest(`http://localhost/api/recipes/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/recipes/[id]", () => {
  describe("GET", () => {
    it("returns a recipe by id", async () => {
      const recipe = makeRecipe({ _id: "recipe_001", name: "Vegetable Soup" });
      await Recipe.create(recipe);

      const res = await GET(new NextRequest("http://localhost/api/recipes/recipe_001"), makeParams("recipe_001"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body._id).toBe("recipe_001");
      expect(body.name).toBe("Vegetable Soup");
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await GET(new NextRequest("http://localhost/api/recipes/missing"), makeParams("missing"));

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH", () => {
    it("updates top-level recipe fields", async () => {
      const recipe = makeRecipe({
        _id: "patch_recipe_001",
        name: "Original Name",
        notes: "Original note",
      });
      await Recipe.create(recipe);

      const res = await PATCH(
        makePatchRequest("patch_recipe_001", {
          name: "Updated Name",
          notes: "Updated note",
          isDraft: false,
        }),
        makeParams("patch_recipe_001"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe("Updated Name");
      expect(body.notes).toBe("Updated note");
      expect(body.isDraft).toBe(false);
    });

    it("updates nested nutritional_info", async () => {
      const recipe = makeRecipe({
        _id: "patch_recipe_002",
        nutritional_info: makeNutrition({
          calories: 200,
          protein: 5,
          fat: 6,
          carbs: 30,
          fiber: 4,
          sodium: 120,
        }),
      });
      await Recipe.create(recipe);

      const res = await PATCH(
        makePatchRequest("patch_recipe_002", {
          nutritional_info: {
            calories: 350,
            protein: 12,
            fat: 8,
            carbs: 42,
            fiber: 7,
            sodium: 240,
          },
        }),
        makeParams("patch_recipe_002"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.nutritional_info.calories).toBe(350);
      expect(body.nutritional_info.sodium).toBe(240);
    });

    it("returns 400 for invalid JSON body", async () => {
      const recipe = makeRecipe({ _id: "patch_recipe_invalid_json" });
      await Recipe.create(recipe);

      const req = new NextRequest("http://localhost/api/recipes/patch_recipe_invalid_json", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "{invalid-json",
      });

      const res = await PATCH(req, makeParams("patch_recipe_invalid_json"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid JSON body");
    });

    it("returns 400 for invalid nested data", async () => {
      const recipe = makeRecipe({ _id: "patch_recipe_invalid_data" });
      await Recipe.create(recipe);

      const res = await PATCH(
        makePatchRequest("patch_recipe_invalid_data", {
          nutritional_info: {
            calories: 100,
            protein: 10,
            fat: 5,
            carbs: 20,
            fiber: 3,
            // sodium missing
          },
        }),
        makeParams("patch_recipe_invalid_data"),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid Data");
    });

    it("returns 400 for unknown fields (strict mode)", async () => {
      const recipe = makeRecipe({ _id: "patch_recipe_strict" });
      await Recipe.create(recipe);

      const res = await PATCH(
        makePatchRequest("patch_recipe_strict", {
          notAField: "nope",
        }),
        makeParams("patch_recipe_strict"),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid Data");
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await PATCH(makePatchRequest("missing", { notes: "Updated note" }), makeParams("missing"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Recipe not found");
    });
  });

  describe("DELETE", () => {
    it("deletes a recipe", async () => {
      const recipe = makeRecipe({ _id: "delete_recipe_001" });
      await Recipe.create(recipe);

      const res = await DELETE(
        new NextRequest("http://localhost/api/recipes/delete_recipe_001"),
        makeParams("delete_recipe_001"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Recipe deleted successfully");
      expect(body.id).toBe("delete_recipe_001");

      const remaining = await Recipe.findById("delete_recipe_001");
      expect(remaining).toBeNull();
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await DELETE(new NextRequest("http://localhost/api/recipes/missing"), makeParams("missing"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Recipe not found");
    });
  });
});
