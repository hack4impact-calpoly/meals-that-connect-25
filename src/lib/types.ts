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

export type RecipeReference = {
  id: string;
  name: string;
};

export type Recipe = {
  _id: string;
  name: string;
  serving: number;
  tags?: string[];
  ingredients?: Ingredient[];
  instructions?: string;
  comments?: string;
  imageUrl?: string;
  lastVerified?: string | Date;
  verifiedBy?: string;
  isDraft: boolean;
  nutritional_info: Nutrition;
};

export type Combo = {
  _id: string;
  name: string;
  serving: number;
  entrees?: RecipeReference[];
  sides?: RecipeReference[];
  fruits?: RecipeReference[];
  filters?: string[];
  notes?: string;
  allergens?: string[];
  instructions?: string;
  nutritional_info: Nutrition;
  imageUrl?: string;
  isDraft: boolean;
};

export type CategoryValue = "Entree" | "Side" | "Fruit" | "Combo";
export type FilterSelections = Record<string, Set<string>>;
