import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { KitchenService } from '../../shared/apis/kitchen.service';
import { InventoryService } from '../../shared/apis/inventory.service';
import { DatePipe } from '@angular/common';
import { ModalRecipesService } from './modal-recipes.service';

@Component({
  selector: 'app-modal-recipes',
  imports: [NgClass, DatePipe],
  templateUrl: './modal-recipes.component.html',
  styleUrl: './modal-recipes.component.css',
})
export class ModalRecipesComponent {
  private kitchenService = inject(KitchenService);
  private inventoryService = inject(InventoryService);
  modalRecipesService = inject(ModalRecipesService);
  errorMessage = signal('');
  loading = signal(false);

  recipes = signal<any[]>([]);

  ngOnInit(): void {
    this.modalRecipesService.$open.subscribe((value) => {
      if (value && this.recipes()?.length === 0) {
        this.getRecipes();
      }
    });
  }

  getRecipes() {
    this.inventoryService.getIngredients().subscribe({
      next: ({ data: _ingredients }) => {
        const ingredients = _ingredients.reduce((acc: any, ingredient: any) => {
          if (!acc[ingredient.id]) {
            acc[ingredient.id] = ingredient;
          }
          return acc;
        }, {});
        this.loading.set(true);
        this.errorMessage.set('');
        if (this.recipes()?.length > 0) return;
        this.kitchenService.getRecipes().subscribe({
          next: (res) => {
            this.loading.set(false);
            if (res.error) return this.errorMessage.set(res?.error?.message);
            const recipes = res.data.map((recipe: any) => {
              return {
                ...recipe,
                ingredients: recipe.ingredients.map((ingredient: any) => {
                  return ingredients[ingredient.ingredientId];
                }),
              };
            });
            this.recipes.set(recipes);
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(err?.error?.message);
          },
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
