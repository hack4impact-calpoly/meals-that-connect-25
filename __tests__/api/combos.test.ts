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
    it("returns paginated combos", async () => {
      await seedCombos(5);

      const res = await GET(makeRequest("GET"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(5);
      expect(body.page).toBe(1);
      expect(body.totalPages).toBe(1);
      expect(body.totalCount).toBe(5);
    });

    it("returns empty array when no combos exist", async () => {
      const res = await GET(makeRequest("GET"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual([]);
      expect(body.totalCount).toBe(0);
    });

    it("filters by isDraft=true", async () => {
      await seedCombos(3, { isDraft: true });
      await seedCombos(2, { isDraft: false });

      const res = await GET(new NextRequest("http://localhost/api/combos?isDraft=true"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(3);

      for (const combo of body.data) {
        expect(combo.isDraft).toBe(true);
      }
    });

    it("filters by isDraft=false", async () => {
      await seedCombos(3, { isDraft: true });
      await seedCombos(2, { isDraft: false });

      const res = await GET(new NextRequest("http://localhost/api/combos?isDraft=false"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      for (const combo of body.data) {
        expect(combo.isDraft).toBe(false);
      }
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
        // missing required fields
      };

      const res = await POST(makeRequest("POST", invalidCombo));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});
