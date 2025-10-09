export interface PredefinedPrompt {
  [key: string]: {
    displayText: string;
    prompt: string;
  };
}

export const predefinedPrompts: PredefinedPrompt = {
  smart_order_ingredients: {
    displayText:
      'Creame una orden inteligente de 3 platos con los ingredientes con mayor disponibilidad',
    prompt:
      'Creame una orden de 3 recetas que usen los ingredientes con mayor disponibilidad en el inventario',
  },
};
