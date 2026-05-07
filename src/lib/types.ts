export type Ingredient = {
  name: string;
  quantity: number;
  units: string;
};

export type Nutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sodium: number;
};

export const RECIPE_CATEGORIES = ["Entree", "Vegetable", "Fruit", "Grain"];
export type RecipeCategory = "Entree" | "Vegetable" | "Fruit" | "Grain";

export type Recipe = {
  _id: string;
  name: string;
  serving: number;

  category: RecipeCategory;
  isSubrecipe: boolean;

  filters?: string[];
  allergens?: string[];

  ingredients?: Ingredient[];
  instructions?: string;
  notes?: string;
  imageUrl?: string;
  lastVerified?: string | Date;
  verifiedBy?: string;

  isDraft: boolean;
  nutritional_info: Nutrition;
};

export type RecipePreview = {
  _id: string;
  name: string;
};

export type Combo = {
  _id: string;
  name: string;
  serving: number;

  entrees?: string[];
  vegetables?: string[];
  fruits?: string[];
  grains?: string[];

  filters?: string[];
  allergens?: string[];

  notes?: string;
  instructions?: string;
  imageUrl?: string;

  isDraft: boolean;
};

// TODO: add a "populate" parameter to the combo schema that will also preview the recipes
// This cuts the fetches required for the recipes page by 90%.
export type PopulatedCombo = Omit<Combo, "entrees" | "vegetables" | "fruits" | "grains"> & {
  entrees: RecipePreview[];
  vegetables: RecipePreview[];
  fruits: RecipePreview[];
  grains: RecipePreview[];
};

export const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export type SortOption = "lastUpdated" | "createdDate" | "aToZ" | "zToA";
export type MealCategory = RecipeCategory | "Combo";
export type FilterSelections = Record<string, Set<string>>;

export const TAG_STYLES = {
  Combo: "bg-combo-bg text-combo-text",
  Entree: "bg-entree-bg text-entree-text",
  Vegetable: "bg-vegetable-bg text-vegetable-text",
  Fruit: "bg-fruit-bg text-fruit-text",
  Grain: "bg-grain-bg text-grain-text",
} satisfies Record<MealCategory, string>;
