

export interface IOrderHistory {
    id: number
    status: string
    listRecipes: IRecipe[]
    createdAt: string
    updatedAt: string
}

export interface IOrderHistoryUpdate {
    id: number
    status?: string
    listRecipes?: IRecipe[]
    createdAt?: string
    updatedAt?: string
}

export interface IRecipe {
    id: number
    name: string
    status: string
    createdAt: string
    updatedAt: string
    ingredients: Ingredient[]
}

interface Ingredient {
    quantity: number
    recipeId: number
    ingredientId: number
    missingAmount: number
    ingredientName: string
    createdAt: string
    updatedAt: string
}
