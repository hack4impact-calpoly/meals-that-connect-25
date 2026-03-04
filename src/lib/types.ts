export type Recipe = {
  _id: string;
  name: string;
  serving?: number;
  tags?: string[];
  ingredients?: unknown[];
  instructions?: string;
  imageUrl?: string;
  isDraft: boolean;
};

export type Combo = {
  _id: string;
  name: string;
  serving: number;
  sides?: unknown[];
  fruits?: unknown[];
  imageUrl?: string;
  isDraft: boolean;
};

export type CategoryValue = "entree" | "side" | "fruit" | "combo";
export type FilterSelections = Record<string, Set<string>>;
