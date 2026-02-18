import { withMongo } from "../helpers/mongo";
import { GET, POST } from "@/app/api/combos/route";
import Combo from "@/database/ComboSchema";
import { seedCombos, makeCombo } from "../helpers/combos";
import { NextRequest } from "next/server";

withMongo();

function makeRequest(method: string, body?: any, url = "http://localhost/api/combos") {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("/api/combos", () => {
  describe("GET", () => {
    it("returns all combos", async () => {
      await seedCombos(5);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toHaveLength(5);
    });

    it("returns empty array when no combos exist", async () => {
      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual([]);
    });
  });

  describe("POST", () => {
    it("creates a combo", async () => {
      const combo = makeCombo();

      const res = await POST(makeRequest("POST", combo));
      expect(res.status).toBe(201);

      const count = await Combo.countDocuments();
      expect(count).toBe(1);
    });

    it("returns 400 when required fields are missing", async () => {
      const invalidCombo = {
        name: "Invalid Combo",
        // missing _id, serving
      };

      const res = await POST(makeRequest("POST", invalidCombo));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});
