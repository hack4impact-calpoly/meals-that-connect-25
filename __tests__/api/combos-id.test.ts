import { withMongo } from "../helpers/mongo";
import { GET, PATCH, DELETE } from "@/app/api/combos/[id]/route";
import Combo from "@/database/ComboSchema";
import { makeCombo } from "../helpers/combos";
import { NextRequest } from "next/server";

withMongo();

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePatchRequest(id: string, body: any) {
  return new NextRequest(`http://localhost/api/combos/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/combos/[id]", () => {
  describe("GET", () => {
    it("returns a combo by id", async () => {
      const combo = makeCombo({ _id: "combo_001", name: "Lunch Combo" });
      await Combo.create(combo);

      const res = await GET(new NextRequest("http://localhost/api/combos/combo_001"), makeParams("combo_001"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body._id).toBe("combo_001");
      expect(body.name).toBe("Lunch Combo");
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await GET(new NextRequest("http://localhost/api/combos/missing"), makeParams("missing"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Combo not found");
    });
  });

  describe("PATCH", () => {
    it("updates top-level combo fields", async () => {
      const combo = makeCombo({
        _id: "patch_combo_001",
        name: "Original Combo",
        notes: "Original note",
      });
      await Combo.create(combo);

      const res = await PATCH(
        makePatchRequest("patch_combo_001", {
          name: "Updated Combo",
          notes: "Updated note",
          isDraft: false,
        }),
        makeParams("patch_combo_001"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.name).toBe("Updated Combo");
      expect(body.notes).toBe("Updated note");
      expect(body.isDraft).toBe(false);
    });

    it("updates recipe id arrays", async () => {
      const combo = makeCombo({
        _id: "patch_combo_002",
        entrees: ["recipe_a"],
        sides: ["recipe_b"],
        fruits: ["recipe_c"],
      });
      await Combo.create(combo);

      const res = await PATCH(
        makePatchRequest("patch_combo_002", {
          entrees: ["recipe_x", "recipe_y"],
          sides: ["recipe_z"],
          fruits: [],
        }),
        makeParams("patch_combo_002"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.entrees).toEqual(["recipe_x", "recipe_y"]);
      expect(body.sides).toEqual(["recipe_z"]);
      expect(body.fruits).toEqual([]);
    });

    it("returns 400 for invalid JSON body", async () => {
      const combo = makeCombo({ _id: "patch_combo_invalid_json" });
      await Combo.create(combo);

      const req = new NextRequest("http://localhost/api/combos/patch_combo_invalid_json", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "{invalid-json",
      });

      const res = await PATCH(req, makeParams("patch_combo_invalid_json"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid JSON body");
    });

    it("returns 400 for invalid data", async () => {
      const combo = makeCombo({ _id: "patch_combo_invalid_data" });
      await Combo.create(combo);

      const res = await PATCH(
        makePatchRequest("patch_combo_invalid_data", {
          name: null,
        }),
        makeParams("patch_combo_invalid_data"),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid Data");
    });

    it("returns 400 for unknown fields (strict mode)", async () => {
      const combo = makeCombo({ _id: "patch_combo_strict" });
      await Combo.create(combo);

      const res = await PATCH(
        makePatchRequest("patch_combo_strict", {
          notAField: "nope",
        }),
        makeParams("patch_combo_strict"),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Invalid Data");
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await PATCH(makePatchRequest("missing", { notes: "Updated note" }), makeParams("missing"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Combo not found");
    });
  });

  describe("DELETE", () => {
    it("deletes a combo", async () => {
      const combo = makeCombo({ _id: "delete_combo_001" });
      await Combo.create(combo);

      const res = await DELETE(
        new NextRequest("http://localhost/api/combos/delete_combo_001"),
        makeParams("delete_combo_001"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Combo deleted successfully");
      expect(body.id).toBe("delete_combo_001");

      const remaining = await Combo.findById("delete_combo_001");
      expect(remaining).toBeNull();
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await DELETE(new NextRequest("http://localhost/api/combos/missing"), makeParams("missing"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error).toBe("Combo not found");
    });
  });
});
