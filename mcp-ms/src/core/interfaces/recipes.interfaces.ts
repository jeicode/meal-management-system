export interface IRecipeHistory {
    id: number
    name: string
    createdAt: string
    updatedAt: string
    ingredients: Ingredient[]
    status: string
  }
  
interface Ingredient {
    recipeId: number
    ingredientId: number
    quantity: number
    ingredientName: string
    missingAmount: number
  }
  