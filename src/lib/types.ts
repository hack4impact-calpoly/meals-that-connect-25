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

export type RecipeBuckets<T = string> = {
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

  ingredients: Ingredient[];
  instructions?: string;
  notes?: string;
  imageUrl?: string;
  lastVerified?: string;
  verifiedBy?: string;

  isDraft: boolean;
  nutritional_info: Nutrition;
} & MealFilterFields;

export type RecipePreview = {
  _id: string;
  name: string;
  category: RecipeCategory;
};

export type RecipeMinimal = {
  _id: string;
  name: string;
};

export type RecipeNutritionOnly = RecipePreview & { serving: number; nutritional_info: Nutrition };
export type RecipeFiltersOnly = RecipePreview & MealFilterFields;

// Takes the type of the recipe buckets.
// By default should be string IDs, but can request Recipe or RecipePreviews from the API as well.
export type Combo<T = string> = {
  _id: string;
  name: string;
  serving: number;

  notes?: string;
  instructions?: string;
  imageUrl?: string;

  isDraft: boolean;
  nutritional_info: Nutrition;
} & MealFilterFields &
  RecipeBuckets<T>;

/* -------------------------------------------------------------------------- */
/* Calendar and date types                                                    */
/* -------------------------------------------------------------------------- */

export type CalendarDay<T = Recipe> = {
  _id: string; // YYYYMMDD
} & RecipeBuckets<T>;

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

export const PROTEIN_SOURCES = ["Chicken", "Beef", "Fish", "Tofu", "Beans"] as const;
export type ProteinSource = (typeof PROTEIN_SOURCES)[number];

export const DIETARY_KEYS = ["vegetarian", "vegan", "halal", "kosher"] as const;
export type DietaryKey = (typeof DIETARY_KEYS)[number];

export const EXCLUSION_KEYS = ["dairyFree", "glutenFree", "nutFree", "soyFree", "shellfishFree"] as const;
export type ExclusionKey = (typeof EXCLUSION_KEYS)[number];

export const SERVING_FILTER_KEYS = ["single-serving", "small-serving", "family-serving", "party-serving"] as const;
export type ServingFilterKey = (typeof SERVING_FILTER_KEYS)[number];

export const ADDITIONAL_FILTER_KEYS = ["isSubrecipe"] as const;
export type AdditionalFilterKey = (typeof ADDITIONAL_FILTER_KEYS)[number];

export type DietaryFlags = Record<DietaryKey, boolean>;
export type ExclusionFlags = Record<ExclusionKey, boolean>;

export type MealFilterFields = {
  proteinSources: ProteinSource[];
  dietary: DietaryFlags;
  exclusions: ExclusionFlags;
};

export type FilterOptionId = ExclusionKey | DietaryKey | ProteinSource | ServingFilterKey | AdditionalFilterKey;
export type FilterSelections = {
  proteinSources: Set<FilterOptionId>;
  dietary: Set<FilterOptionId>;
  exclusions: Set<FilterOptionId>;
  servings: Set<FilterOptionId>;
  additional: Set<FilterOptionId>;
};
export type FilterSectionId = keyof FilterSelections;

export type FilterOption = {
  id: FilterOptionId;
  label: string;
};

export type FilterSection = {
  id: FilterSectionId;
  label: string;
  options: FilterOption[];
};

export const EMPTY_DIETARY_FLAGS: DietaryFlags = {
  vegetarian: false,
  vegan: false,
  halal: false,
  kosher: false,
};

export const EMPTY_EXCLUSION_FLAGS: ExclusionFlags = {
  dairyFree: false,
  glutenFree: false,
  nutFree: false,
  soyFree: false,
  shellfishFree: false,
};

export function createEmptyFilterSelections(): FilterSelections {
  return {
    proteinSources: new Set(),
    dietary: new Set(),
    exclusions: new Set(),
    servings: new Set(),
    additional: new Set(),
  };
}

export const FILTER_SECTIONS: FilterSection[] = [
  {
    id: "exclusions",
    label: "Allergens / Exclusions",
    options: [
      { id: "dairyFree", label: "Dairy-Free" },
      { id: "glutenFree", label: "Gluten-Free" },
      { id: "nutFree", label: "Nut-Free" },
      { id: "soyFree", label: "Soy-Free" },
      { id: "shellfishFree", label: "Shellfish-Free" },
    ],
  },
  {
    id: "proteinSources",
    label: "Proteins",
    options: [
      { id: "Chicken", label: "Chicken" },
      { id: "Beef", label: "Beef" },
      { id: "Fish", label: "Fish" },
      { id: "Tofu", label: "Tofu" },
      { id: "Beans", label: "Beans" },
    ],
  },
  {
    id: "dietary",
    label: "Dietary Preferences",
    options: [
      { id: "vegetarian", label: "Vegetarian" },
      { id: "vegan", label: "Vegan" },
      { id: "halal", label: "Halal" },
      { id: "kosher", label: "Kosher" },
    ],
  },
  {
    id: "servings",
    label: "Serving Size",
    options: [
      { id: "single-serving", label: "Single Serving" },
      { id: "small-serving", label: "Small Serving" },
      { id: "family-serving", label: "Family Serving" },
      { id: "party-serving", label: "Party Serving" },
    ],
  },
  {
    id: "additional",
    label: "Additional Filters",
    options: [{ id: "isSubrecipe", label: "Subrecipes Only" }],
  },
];

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

export const CATEGORY_DISPLAY_MAP = {
  Combo: COMBO_CATEGORY_DISPLAY,
  Entree: ENTREE_CATEGORY_DISPLAY,
  Vegetable: VEGETABLE_CATEGORY_DISPLAY,
  Fruit: FRUIT_CATEGORY_DISPLAY,
  Grain: GRAIN_CATEGORY_DISPLAY,
} satisfies Record<CategoryValue, CategoryDisplayType>;

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export const USER_ROLES = ["Admin", "Dining Site Staff", "Kitchen Staff"] as const;
export type UserRole = (typeof USER_ROLES)[number];
