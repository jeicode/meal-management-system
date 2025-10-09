export interface IOrderHistory {
  id: number;
  status: string;
  listRecipes: IRecipe[];
  totalIngredients?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface IRecipe {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  imageUrl: string;
  updatedAt: string;
  ingredients: Ingredient[];
}

interface Ingredient {
  id: number;
  quantity: number;
  recipeId: number;
  ingredientId: number;
  name: string;
  missingAmount: number;
  ingredientName: string;
  createdAt: string;
  updatedAt: string;
}
