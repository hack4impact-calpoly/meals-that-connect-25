import { withMongo } from "../helpers/mongo";
import { GET, POST } from "@/app/api/recipes/route";
import Recipe from "@/database/RecipeSchema";
import { seedRecipes, makeRecipe } from "../helpers/recipes";
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
      expect(body.totalPages).toBe(2);
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

    it("filters recipes by tags", async () => {
      await seedRecipes(3, { tags: ["Soup"] });
      await seedRecipes(2, { tags: ["Dessert"] });

      const res = await GET(new NextRequest("http://localhost/api/recipes?tags=Soup"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(3);

      for (const recipe of body.data) {
        expect(recipe.tags).toContain("Soup");
      }
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
        // missing required fields
      };

      const res = await POST(makeRequest("POST", invalidRecipe));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});
