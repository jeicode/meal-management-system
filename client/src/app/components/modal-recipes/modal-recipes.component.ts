import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { KitchenService } from '../../shared/apis/kitchen.service';
import { InventoryService } from '../../shared/apis/inventory.service';
import { DatePipe } from '@angular/common';
import { ModalRecipesService } from './modal-recipes.service';
import { firstValueFrom } from 'rxjs';
import { IRecipe } from '../../interfaces/order-history.interface';

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
  ingredients = signal<{ [key: string]: any }>({});

  recipes = signal<IRecipe[]>([]);

  ngOnInit(): void {
    this.modalRecipesService.$open.subscribe((value) => {
      if (value) {
        this.getRecipes();
      }
    });
  }

  async getRecipes() {
    this.errorMessage.set('');
    this.loading.set(true);
    if (Object.keys(this.ingredients()).length === 0) {
      await this.setIngredients();
    }
    this.kitchenService.getRecipes().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.error) return this.errorMessage.set(res?.error?.message);
        const recipes = res?.data?.map((recipe: any) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients.map((ingredient: any) => {
              this.ingredients()[ingredient.ingredientId].quantity = ingredient.quantity;
              return this.ingredients()[ingredient.ingredientId];
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
  }

  async setIngredients() {
    const { data: _ingredients } = await firstValueFrom(this.inventoryService.getIngredients());
    const ingredients = _ingredients.reduce((acc: any, ingredient: any) => {
      if (!acc[ingredient.id]) {
        acc[ingredient.id] = ingredient;
      }
      return acc;
    }, {});
    this.ingredients.set(ingredients);
  }
}
