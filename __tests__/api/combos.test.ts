import { withMongo } from "../helpers/mongo";
import { GET, POST } from "@/app/api/combos/route";
import Combo from "@/database/ComboSchema";
import { seedCombos, makeCombo } from "../helpers/combos";
import { NextRequest } from "next/server";

withMongo();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      await seedCombos(15);

      const res = await GET(new NextRequest("http://localhost/api/combos?page=1"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(10);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.totalPages).toBe(2);
      expect(body.totalCount).toBe(15);
    });

    it("respects a custom limit", async () => {
      await seedCombos(12);

      const res = await GET(new NextRequest("http://localhost/api/combos?page=1&limit=5"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(5);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(5);
      expect(body.totalPages).toBe(3);
      expect(body.totalCount).toBe(12);
    });

    it("returns empty array when no combos exist", async () => {
      const res = await GET(new NextRequest("http://localhost/api/combos"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toEqual([]);
      expect(body.totalCount).toBe(0);
      expect(body.totalPages).toBe(0);
    });

    it("filters combos by name case-insensitively", async () => {
      await Combo.create([
        makeCombo({ name: "Vegetarian Lunch Combo" }),
        makeCombo({ name: "Beef Dinner Combo" }),
        makeCombo({ name: "vegan snack combo" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/combos?name=veg"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((combo: any) => combo.name);
      expect(names).toEqual(expect.arrayContaining(["Vegetarian Lunch Combo", "vegan snack combo"]));
    });

    it("filters combos by filters query", async () => {
      await seedCombos(3, { filters: ["Vegetarian"] });
      await seedCombos(2, { filters: ["Beef"] });

      const res = await GET(new NextRequest("http://localhost/api/combos?filters=Vegetarian"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(3);

      for (const combo of body.data) {
        expect(combo.filters).toContain("Vegetarian");
      }
    });

    it("filters combos by serving range", async () => {
      await Combo.create([
        makeCombo({ name: "Single", serving: 1 }),
        makeCombo({ name: "Small", serving: 2 }),
        makeCombo({ name: "Family A", serving: 4 }),
        makeCombo({ name: "Family B", serving: 6 }),
        makeCombo({ name: "Party", serving: 8 }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/combos?servings=family-serving"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((combo: any) => combo.name);
      expect(names).toEqual(expect.arrayContaining(["Family A", "Family B"]));
    });

    it("filters combos by multiple serving buckets", async () => {
      await Combo.create([
        makeCombo({ name: "Single", serving: 1 }),
        makeCombo({ name: "Small", serving: 3 }),
        makeCombo({ name: "Family", serving: 5 }),
        makeCombo({ name: "Party", serving: 7 }),
      ]);

      const res = await GET(
        new NextRequest("http://localhost/api/combos?servings=single-serving&servings=party-serving"),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(2);

      const names = body.data.map((combo: any) => combo.name);
      expect(names).toEqual(expect.arrayContaining(["Single", "Party"]));
    });

    it("combines filters and isDraft", async () => {
      await Combo.create([
        makeCombo({ name: "Veg Draft", filters: ["Vegetarian"], isDraft: true }),
        makeCombo({ name: "Veg Published", filters: ["Vegetarian"], isDraft: false }),
        makeCombo({ name: "Beef Draft", filters: ["Beef"], isDraft: true }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/combos?filters=Vegetarian&isDraft=true"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toBe("Veg Draft");
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

    it("sorts combos aToZ", async () => {
      await Combo.create([
        makeCombo({ name: "Carrot Combo" }),
        makeCombo({ name: "Apple Combo" }),
        makeCombo({ name: "Banana Combo" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/combos?sortBy=aToZ"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const names = body.data.map((combo: any) => combo.name);
      expect(names).toEqual(["Apple Combo", "Banana Combo", "Carrot Combo"]);
    });

    it("sorts combos zToA", async () => {
      await Combo.create([
        makeCombo({ name: "Carrot Combo" }),
        makeCombo({ name: "Apple Combo" }),
        makeCombo({ name: "Banana Combo" }),
      ]);

      const res = await GET(new NextRequest("http://localhost/api/combos?sortBy=zToA"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const names = body.data.map((combo: any) => combo.name);
      expect(names).toEqual(["Carrot Combo", "Banana Combo", "Apple Combo"]);
    });

    it("sorts combos by createdDate descending", async () => {
      await Combo.create(makeCombo({ _id: "older_combo", name: "Older Combo" }));
      await sleep(20);
      await Combo.create(makeCombo({ _id: "newer_combo", name: "Newer Combo" }));

      const res = await GET(new NextRequest("http://localhost/api/combos?sortBy=createdDate"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const ids = body.data.map((combo: any) => combo._id);
      expect(ids[0]).toBe("newer_combo");
      expect(ids[1]).toBe("older_combo");
    });

    it("sorts combos by lastUpdated descending", async () => {
      await Combo.create(makeCombo({ _id: "combo_a", name: "Combo A", notes: "old" }));
      await sleep(20);
      await Combo.create(makeCombo({ _id: "combo_b", name: "Combo B", notes: "old" }));

      await sleep(20);
      await Combo.findByIdAndUpdate("combo_a", { $set: { notes: "recently updated" } });

      const res = await GET(new NextRequest("http://localhost/api/combos?sortBy=lastUpdated"));
      const body = await res.json();

      expect(res.status).toBe(200);

      const ids = body.data.map((combo: any) => combo._id);
      expect(ids[0]).toBe("combo_a");
      expect(ids[1]).toBe("combo_b");
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
      };

      const res = await POST(makeRequest("POST", invalidCombo));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBeDefined();
    });
  });
});
