import { withMongo } from "../helpers/mongo";
import { GET, PATCH, DELETE } from "@/app/api/combos/[id]/route";
import Combo from "@/database/ComboSchema";
import { makeCombo } from "../helpers/combos";
import { NextRequest } from "next/server";

withMongo();

describe("/api/combos/[id]", () => {
  describe("GET", () => {
    it("returns a combo by id", async () => {
      const combo = makeCombo({ _id: "combo_0001" });
      await Combo.create(combo);

      const res = await GET(new NextRequest("http://localhost/api/combos/combo_0001"), {
        params: { id: "combo_0001" },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body._id).toBe("combo_0001");
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await GET(new NextRequest("http://localhost/api/combos/missing"), {
        params: { id: "missing" },
      });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH", () => {
    it("updates a combo", async () => {
      const combo = makeCombo({ _id: "patch-combo" });
      await Combo.create(combo);

      const res = await PATCH(
        new NextRequest("http://localhost/api/combos/patch-combo", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notes: "Updated notes" }),
        }),
        { params: { id: "patch-combo" } },
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.notes).toBe("Updated notes");
    });

    it("returns 400 for unknown fields (strict mode)", async () => {
      const combo = makeCombo({ _id: "strict-combo" });
      await Combo.create(combo);

      const res = await PATCH(
        new NextRequest("http://localhost/api/combos/strict-combo", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notAField: "nope" }),
        }),
        { params: { id: "strict-combo" } },
      );

      expect(res.status).toBe(400);
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await PATCH(
        new NextRequest("http://localhost/api/combos/missing", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ notes: "x" }),
        }),
        { params: { id: "missing" } },
      );

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("deletes a combo", async () => {
      const combo = makeCombo({ _id: "delete-combo" });
      await Combo.create(combo);

      const res = await DELETE(new NextRequest("http://localhost/api/combos/delete-combo"), {
        params: { id: "delete-combo" },
      });

      expect(res.status).toBe(200);

      const remaining = await Combo.findById("delete-combo");
      expect(remaining).toBeNull();
    });

    it("returns 404 when combo does not exist", async () => {
      const res = await DELETE(new NextRequest("http://localhost/api/combos/missing"), {
        params: { id: "missing" },
      });

      expect(res.status).toBe(404);
    });
  });
});
