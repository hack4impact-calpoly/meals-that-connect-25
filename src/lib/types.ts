import { Apple, Carrot, CircleAlert, LucideIcon, Soup, Tag, Utensils, Wheat } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Basic shared types                                                         */
/* -------------------------------------------------------------------------- */

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

export type NutrientDisplay = {
  key: keyof Nutrition;
  label: string;
  unit: string;
};

/* -------------------------------------------------------------------------- */
/* Nutrition constants                                                        */
/* -------------------------------------------------------------------------- */

export const ZERO_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sodium: 0,
};

export const WEEKLY_NUTRITION_QUOTA: Nutrition = {
  calories: 3000,
  protein: 75,
  fat: 100,
  carbs: 350,
  fiber: 40,
  sodium: 3200,
};

export const NUTRIENT_LABELS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
  { key: "sodium", label: "Sodium", unit: "mg" },
] satisfies NutrientDisplay[];

/* -------------------------------------------------------------------------- */
/* Recipe categories and buckets                                              */
/* -------------------------------------------------------------------------- */

export const RECIPE_CATEGORIES = ["Entree", "Vegetable", "Fruit", "Grain"] as const;
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export const RECIPE_BUCKETS = ["entrees", "vegetables", "fruits", "grains"] as const;
export type RecipeBucket = (typeof RECIPE_BUCKETS)[number];

export const CATEGORY_VALUES = ["Combo", ...RECIPE_CATEGORIES] as const;
export type CategoryValue = (typeof CATEGORY_VALUES)[number];

export const CATEGORY_TO_BUCKET = {
  Entree: "entrees",
  Vegetable: "vegetables",
  Fruit: "fruits",
  Grain: "grains",
} as const satisfies Record<RecipeCategory, RecipeBucket>;

export const BUCKET_TO_CATEGORY = {
  entrees: "Entree",
  vegetables: "Vegetable",
  fruits: "Fruit",
  grains: "Grain",
} as const satisfies Record<RecipeBucket, RecipeCategory>;

export type RecipeBuckets<T> = {
  // Can be parametrized as strings (for _id), full recipes, or previews.
  entrees: T[];
  vegetables: T[];
  fruits: T[];
  grains: T[];
};

/* -------------------------------------------------------------------------- */
/* Core data models                                                           */
/* -------------------------------------------------------------------------- */

export type Recipe = {
  _id: string;
  name: string;
  serving: number;

  category: RecipeCategory;
  isSubrecipe: boolean;

  filters: string[];
  allergens: string[];

  ingredients: Ingredient[];
  instructions?: string;
  notes?: string;
  imageUrl?: string;
  lastVerified?: string;
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

  filters: string[];
  allergens: string[];

  notes?: string;
  instructions?: string;
  imageUrl?: string;

  isDraft: boolean;
} & RecipeBuckets<string>;

// TODO: add a "populate" parameter to the combo schema that will also preview the recipes
// This cuts the fetches required for the recipes page by 90%.
// export type PopulatedCombo = Omit<Combo, "entrees" | "vegetables" | "fruits" | "grains"> & {
//   entrees: RecipePreview[];
//   vegetables: RecipePreview[];
//   fruits: RecipePreview[];
//   grains: RecipePreview[];
// };

/* -------------------------------------------------------------------------- */
/* Calendar and date types                                                    */
/* -------------------------------------------------------------------------- */

export type CalendarDay = {
  _id: string; // YYYYMMDD
} & RecipeBuckets<Recipe>;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
export type Month = (typeof MONTHS)[number];

/* -------------------------------------------------------------------------- */
/* Filtering                                                                  */
/* -------------------------------------------------------------------------- */

export type FilterSelections = Record<string, Set<string>>;

export const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

/* -------------------------------------------------------------------------- */
/* Sorting                                                                    */
/* -------------------------------------------------------------------------- */

export type SortOption = "lastUpdated" | "createdDate" | "aToZ" | "zToA";

export const SORT_OPTIONS = [
  { value: "lastUpdated", label: "Last Updated" },
  { value: "createdDate", label: "Created Date" },
  { value: "aToZ", label: "A to Z" },
  { value: "zToA", label: "Z to A" },
] satisfies Array<{ value: SortOption; label: string }>;

/* -------------------------------------------------------------------------- */
/* Category display / styling                                                 */
/* -------------------------------------------------------------------------- */

export const TAG_STYLES = {
  Combo: "bg-combo-bg text-combo-text",
  Entree: "bg-entree-bg text-entree-text",
  Vegetable: "bg-vegetable-bg text-vegetable-text",
  Fruit: "bg-fruit-bg text-fruit-text",
  Grain: "bg-grain-bg text-grain-text",
} satisfies Record<CategoryValue, string>;

// TODO: pages that use icons should pull from here, so updating happens across all pages.
export type CategoryDisplayType = { category: CategoryValue; label: string; plural: string; icon: LucideIcon };

export const COMBO_ICON = Utensils;
export const ENTREE_ICON = Soup;
export const VEGETABLE_ICON = Carrot;
export const FRUIT_ICON = Apple;
export const GRAIN_ICON = Wheat;
export const FILTER_ICON = Tag;
export const ALLERGEN_ICON = CircleAlert;

export const COMBO_CATEGORY_DISPLAY = {
  category: "Combo",
  label: "Combo",
  plural: "Combos",
  icon: COMBO_ICON,
} satisfies CategoryDisplayType;

export const ENTREE_CATEGORY_DISPLAY = {
  category: "Entree",
  label: "Entrée",
  plural: "Entrées",
  icon: ENTREE_ICON,
} satisfies CategoryDisplayType;

export const VEGETABLE_CATEGORY_DISPLAY = {
  category: "Vegetable",
  label: "Vegetable",
  plural: "Vegetables",
  icon: VEGETABLE_ICON,
} satisfies CategoryDisplayType;

export const FRUIT_CATEGORY_DISPLAY = {
  category: "Fruit",
  label: "Fruit",
  plural: "Fruits",
  icon: FRUIT_ICON,
} satisfies CategoryDisplayType;

export const GRAIN_CATEGORY_DISPLAY = {
  category: "Grain",
  label: "Grain",
  plural: "Grains",
  icon: GRAIN_ICON,
} satisfies CategoryDisplayType;

export const CATEGORY_DISPLAY = [
  COMBO_CATEGORY_DISPLAY,
  ENTREE_CATEGORY_DISPLAY,
  VEGETABLE_CATEGORY_DISPLAY,
  FRUIT_CATEGORY_DISPLAY,
  GRAIN_CATEGORY_DISPLAY,
] satisfies CategoryDisplayType[];

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export const USER_ROLES = ["Admin", "Dining Site Staff", "Kitchen Staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];
