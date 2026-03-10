import { withMongo } from "../helpers/mongo";
import { GET, PATCH, DELETE } from "@/app/api/recipes/[id]/route";
import Recipe from "@/database/RecipeSchema";
import { makeRecipe } from "../helpers/recipes";
import { NextRequest } from "next/server";

withMongo();

describe("/api/recipes/[id]", () => {
  describe("GET", () => {
    it("returns a recipe by id", async () => {
      const recipe = makeRecipe({ _id: "test_recipe_0001" });
      await Recipe.create(recipe);

      const res = await GET(new NextRequest("http://localhost/api/recipes/get-id"), {
        params: { id: "test_recipe_0001" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body._id).toBe("test_recipe_0001");
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await GET(new NextRequest("http://localhost/api/recipes/missing"), { params: { id: "missing" } });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH", () => {
    it("updates a recipe", async () => {
      const recipe = makeRecipe({ _id: "patch-id" });
      await Recipe.create(recipe);

      const res = await PATCH(
        new NextRequest("http://localhost/api/recipes/patch-id", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ comments: "Updated comment" }),
        }),
        { params: { id: "patch-id" } },
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.comments).toBe("Updated comment");
    });

    it("returns 400 for unknown fields (strict mode)", async () => {
      const recipe = makeRecipe({ _id: "strict-id" });
      await Recipe.create(recipe);

      const res = await PATCH(
        new NextRequest("http://localhost/api/recipes/strict-id", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notAField: "nope" }),
        }),
        { params: { id: "strict-id" } },
      );

      expect(res.status).toBe(400);
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await PATCH(
        new NextRequest("http://localhost/api/recipes/missing", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ comments: "x" }),
        }),
        { params: { id: "missing" } },
      );

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("deletes a recipe", async () => {
      const recipe = makeRecipe({ _id: "delete-id" });
      await Recipe.create(recipe);

      const res = await DELETE(new NextRequest("http://localhost/api/recipes/delete-id"), {
        params: { id: "delete-id" },
      });

      expect(res.status).toBe(200);

      const remaining = await Recipe.findById("delete-id");
      expect(remaining).toBeNull();
    });

    it("returns 404 when recipe does not exist", async () => {
      const res = await DELETE(new NextRequest("http://localhost/api/recipes/missing"), { params: { id: "missing" } });

      expect(res.status).toBe(404);
    });
  });
});
