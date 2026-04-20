import { withMongo } from "../helpers/mongo";
import { GET, POST } from "@/app/api/recipes/route";
import Recipe from "@/database/RecipeSchema";
import { seedRecipes, makeRecipe, makeNutrition } from "../helpers/recipes";
import { NextRequest } from "next/server";

withMongo();

function makeRequest(method: string, body?: any, url = "http://localhost/api/recipes") {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("/api/recipes", () => {
  describe("GET", () => {
    it("returns paginated recipes", async () => {
      await seedRecipes(15);

      const res = await GET(new NextRequest("http://localhost/api/recipes?page=1"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(10);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.totalPages).toBe(2);
      expect(body.totalCount).toBe(15);
    });

    it("respects a custom limit", async () => {
      await seedRecipes(15);

      const res = await GET(new NextRequest("http://localhost/api/recipes?page=1&limit=5"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(5);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(5);
      expect(body.totalPages).toBe(3);
      expect(body.totalCount).toBe(15);
    });

    it("returns empty array when page exceeds total pages", async () => {
      await seedRecipes(5);

      const res = await GET(new NextRequest("http://localhost/api/recipes?page=2"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(0);
      expect(body.totalCount).toBe(5);
    });

    it("filters recipes by name case-insensitively", async () => {
      await Recipe.create([
        makeRecipe({ name: "Vegetarian Chili" }),
        makeRecipe({ name: "Chicken Stir Fry" }),
        makeRecipe({ name: "veggie pasta" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/recipes?name=veg"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((recipe: any) => recipe.name);
      expect(names).toEqual(expect.arrayContaining(["Vegetarian Chili", "veggie pasta"]));
    });

    it("filters recipes by filters query", async () => {
      await seedRecipes(3, { filters: ["Vegetarian"], allergens: [] });
      await seedRecipes(2, { filters: ["Beef"], allergens: [] });

      const res = await GET(new NextRequest("http://localhost/api/recipes?filters=Vegetarian"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(3);

      for (const recipe of body.data) {
        expect(recipe.filters).toContain("Vegetarian");
      }
    });

    it("filters recipes by categories query", async () => {
      await seedRecipes(2, { filters: ["Vegetarian"] });
      await seedRecipes(1, { filters: ["Vegan"] });
      await seedRecipes(2, { filters: ["Beef"] });

      const res = await GET(new NextRequest("http://localhost/api/recipes?categories=Vegetarian"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      for (const recipe of body.data) {
        expect(recipe.filters).toContain("Vegetarian");
      }
    });

    it("filters recipes by serving range", async () => {
      await Recipe.create([
        makeRecipe({ name: "Single", serving: 1 }),
        makeRecipe({ name: "Small", serving: 2 }),
        makeRecipe({ name: "Family A", serving: 4 }),
        makeRecipe({ name: "Family B", serving: 6 }),
        makeRecipe({ name: "Party", serving: 8 }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/recipes?servings=family-serving"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((recipe: any) => recipe.name);
      expect(names).toEqual(expect.arrayContaining(["Family A", "Family B"]));
    });

    it("filters recipes by multiple serving buckets", async () => {
      await Recipe.create([
        makeRecipe({ name: "Single", serving: 1 }),
        makeRecipe({ name: "Small", serving: 3 }),
        makeRecipe({ name: "Family", serving: 5 }),
        makeRecipe({ name: "Party", serving: 7 }),
      ]);

      const res = await GET(
        new NextRequest("http://localhost/api/recipes?servings=single-serving&servings=party-serving"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((recipe: any) => recipe.name);
      expect(names).toEqual(expect.arrayContaining(["Single", "Party"]));
    });

    it("combines category and serving filters", async () => {
      await Recipe.create([
        makeRecipe({ name: "Veg Family", filters: ["Vegetarian"], serving: 4 }),
        makeRecipe({ name: "Veg Single", filters: ["Vegetarian"], serving: 1 }),
        makeRecipe({ name: "Beef Family", filters: ["Beef"], serving: 4 }),
      ]);

      const res = await GET(
        new NextRequest("http://localhost/api/recipes?categories=Vegetarian&servings=family-serving"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe("Veg Family");
    });

    it("sorts recipes aToZ", async () => {
      await Recipe.create([
        makeRecipe({ name: "Carrot Soup" }),
        makeRecipe({ name: "Apple Salad" }),
        makeRecipe({ name: "Banana Bread" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/recipes?sortBy=aToZ"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const names = body.data.map((recipe: any) => recipe.name);
      expect(names).toEqual(["Apple Salad", "Banana Bread", "Carrot Soup"]);
    });

    it("sorts recipes zToA", async () => {
      await Recipe.create([
        makeRecipe({ name: "Carrot Soup" }),
        makeRecipe({ name: "Apple Salad" }),
        makeRecipe({ name: "Banana Bread" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/recipes?sortBy=zToA"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const names = body.data.map((recipe: any) => recipe.name);
      expect(names).toEqual(["Carrot Soup", "Banana Bread", "Apple Salad"]);
    });

    it("filters by isDraft=true", async () => {
      await seedRecipes(3, { isDraft: true });
      await seedRecipes(2, { isDraft: false });

      const res = await GET(new NextRequest("http://localhost/api/recipes?isDraft=true"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(3);

      for (const recipe of body.data) {
        expect(recipe.isDraft).toBe(true);
      }
    });

    it("filters by isDraft=false", async () => {
      await seedRecipes(3, { isDraft: true });
      await seedRecipes(2, { isDraft: false });

      const res = await GET(new NextRequest("http://localhost/api/recipes?isDraft=false"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      for (const recipe of body.data) {
        expect(recipe.isDraft).toBe(false);
      }
    });
  });

  describe("POST", () => {
    it("creates a recipe", async () => {
      const recipe = makeRecipe();

      const res = await POST(makeRequest("POST", recipe));
      expect(res.status).toBe(201);

      const count = await Recipe.countDocuments();
      expect(count).toBe(1);
    });

    it("returns 400 when required fields are missing", async () => {
      const invalidRecipe = {
        name: "Invalid Recipe",
      };

      const res = await POST(makeRequest("POST", invalidRecipe));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });

    it("returns 400 when nutritional_info is invalid", async () => {
      const invalidRecipe = makeRecipe({
        nutritional_info: {
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 15,
          fiber: 3,
          // sodium missing
        },
      });

      const res = await POST(makeRequest("POST", invalidRecipe));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});
