export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  serving: number;
  tags: string[];
  ingredients: Ingredient[];
  instructions: string;
  comments: string;
  lastVerified: Date;
  verifiedBy: string;
}
