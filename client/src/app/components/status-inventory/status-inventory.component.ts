import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { SSEService } from '../../shared/apis/sse.service';
import { InventoryService } from '../../shared/apis/inventory.service';


export interface Ingredient {
  id: number
  name: string
  quantity_available: number
  createdAt: string
  updatedAt: string
}

@Component({
  selector: 'app-status-inventory',
  imports: [
    NgClass
  ],
  templateUrl: './status-inventory.component.html',
  styleUrl: './status-inventory.component.css'
})
export class StatusInventoryComponent implements OnInit {
  
  loading = signal(true)
  ingredients = signal<Ingredient[]>([])
  errorMessage = signal('');
  sseService = inject(SSEService)
  inventoryService = inject(InventoryService)

  ngOnInit(): void {
    this.getIngredients()
    this.suscribeIngredients()
  }


  suscribeIngredients() {
    this.loading.set(true)
    this.sseService.subscribeToEvent('inventory.ingredients', (res) => {
      if (res.error) {
        this.loading.set(false)
        return this.errorMessage.set(res.error.message)
      }
      const ingredient = res.data
      this.ingredients.update(last => {
        const index = last.findIndex(i => i.id === ingredient.id)
        if (index !== -1) {
          last[index] = ingredient
          return last
        }
        return last;
      })
    })
  }

  getIngredients() {
    this.loading.set(true)
    this.inventoryService.getIngredients().subscribe(res => {
      if (res.error) {
        this.loading.set(false)
        this.errorMessage.set(res.error.message)
        return
      }
      this.ingredients.set(res.data)
    })
  }

}
