import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { KitchenService } from '../../shared/apis/kitchen.service';

@Component({
  selector: 'app-modal-recipes',
  imports: [NgClass],
  templateUrl: './modal-recipes.component.html',
  styleUrl: './modal-recipes.component.css'
})
export class ModalRecipesComponent {

  private kitchenService = inject(KitchenService)
  errorMessage = signal('')
  loading = signal(false)
  open = signal(false)
  $open =  toObservable(this.open)

  recipes = signal<any[]>([])

  ngOnInit(): void {
    this.$open.subscribe((value) => {
      if (value){
        this.getRecipes()
      }
    })
  }
  
  
  getRecipes() {
    this.loading.set(true)
    this.errorMessage.set('')
    if (this.recipes()?.length > 0) return
    this.kitchenService.getRecipes().subscribe({
      next: (res) => {
        this.loading.set(false)
        if (res.error)return this.errorMessage.set(res?.error?.message)
        this.recipes.set(res.data)
      },
      error: (err) => {
        this.loading.set(false)
        this.errorMessage.set(err?.error?.message)
      }
    })
  }

}
