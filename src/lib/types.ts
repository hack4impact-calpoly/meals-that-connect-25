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

export type Recipe = {
  item: any;
  _id: string;
  name: string;
  serving: number;
  filters: string[]; // never empty bc it will automatically contain Entree/Side/Fruit
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

export type RecipeReference = { id: string; name: string };

export type Combo = {
  _id: string;
  name: string;
  serving: number;
  entrees?: string[];
  sides?: string[];
  fruits?: string[];
  filters: string[]; // never empty bc it will automatically contain Combo
  notes?: string;
  allergens?: string[];
  instructions?: string;
  nutritional_info: Nutrition;
  imageUrl?: string;
  isDraft: boolean;
};

export const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export type SortOption = "lastUpdated" | "createdDate" | "aToZ" | "zToA";
export type CategoryValue = "Entree" | "Side" | "Fruit" | "Combo";
export type FilterSelections = Record<string, Set<string>>;

export const TAG_STYLES: Record<string, string> = {
  Combo: "bg-combo-500 text-combo-900",
  Side: "bg-sides-500 text-sides-900",
  Fruit: "bg-fruit-500 text-fruit-900",
  Entree: "bg-entree-900 text-entree-500",
  Entrée: "bg-entree-900 text-entree-500",
  fallback: "bg-gray-100 text-gray-700",
};
