export type Ingredient = {
  name: string;
  quantity: string;
};

export type Recipe = {
  _id: string;
  name: string;
  serving?: number;
  tags?: string[];
  ingredients?: Ingredient[];
  instructions?: string;
  comments?: string;
  imageUrl?: string;
  lastVerified?: string | Date;
  verifiedBy?: string;
  isDraft: boolean;
};

export type Combo = {
  _id: string;
  name: string;
  serving: number;
  sides?: Ingredient[];
  fruits?: Ingredient[];
  filters?: string[];
  notes?: string;
  allergens?: string[];
  instructions?: string;
  nutritional_info?: number[];
  imageUrl?: string;
  isDraft: boolean;
};

export type CategoryValue = "entree" | "side" | "fruit" | "combo";
export type FilterSelections = Record<string, Set<string>>;
