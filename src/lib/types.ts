export type Subrecipe = {
  _id: string;
  name: string;
  sizePack: string;
  notes: string;
  isDraft: boolean;
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
  type: string;
  serving: number;
  filters: string[];
  allergens?: string[];
  subrecipes?: string[];
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
  vegetables?: string[];
  grains?: string[];
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
export type CategoryValue = "Entree" | "Vegetable" | "Grain" | "Fruit" | "Combo" | "Subrecipe";
export type FilterSelections = Record<string, Set<string>>;
