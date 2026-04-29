export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  _id?: string;
  id?: string;
  name: string;
  serving: number;
  tags: string[];
  ingredients: Ingredient[];
  instructions: string;
  notes: string;
  lastVerified: Date;
  verifiedBy: string;
}
