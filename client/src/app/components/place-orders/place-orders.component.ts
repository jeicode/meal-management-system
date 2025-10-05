import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { KitchenService } from '../../shared/apis/kitchen.service';
import { IOrderHistory } from '../../interfaces/order-history.interface';
import { debounceTime, firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { scrollIntoView } from '../../shared/utils/dom.utils';
import { ToastrService } from 'ngx-toastr';
import { hasErrorsFieldForm } from '../../shared/utils/form';
import { ModalRecipesComponent } from '../modal-recipes/modal-recipes.component';
import { ORDER_STATUS } from '../../constants/kitchen.constants';
import { SSEService } from '../../shared/apis/sse.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-place-orders',
  imports: [ModalRecipesComponent, ReactiveFormsModule, NgClass, DatePipe, RouterLink],
  templateUrl: './place-orders.component.html',
  styleUrl: './place-orders.component.css',
})
export class PlaceOrdersComponent implements OnInit {
  Object = Object;
  private fb = inject(FormBuilder);
  private _kitchenService = inject(KitchenService);
  private _sseService = inject(SSEService);

  lastOrderId = signal(0);
  lasrOrderId$ = toObservable(this.lastOrderId);

  eventSourceOrders!: EventSource;
  toastr = inject(ToastrService);

  errorMessage = signal('');
  ordersDelivered = signal<IOrderHistory[]>([]);

  showErrorsForm = signal(false);
  orderIsProcesing = signal(false);
  initOrderForm = this.fb.group({
    dishes: [null, [Validators.required, Validators.min(1), Validators.max(15)]],
  });

  ngOnInit(): void {
    this.getOrdersDelivered();
    this.suscribeOrdersDelivered();
    this.lasrOrderId$.pipe(debounceTime(200)).subscribe((order) => {
      if (order === 0) return;
      this.toastr.success(`Orden #${order} entregada 🚀`, '', { timeOut: 3000 });
    });
  }

  getOrdersDelivered() {
    let query = `where.status=${ORDER_STATUS.DELIVERED}`;
    query += `&orderBy.createdAt=desc`;
    query += `&take=4`;
    this._kitchenService.getOrders(query).subscribe({
      next: (res) => {
        if (res.error) return this.errorMessage.set(res.error.message);
        res.data = res.data.map((order: any) => {
          return {
            ...order,
            totalIngredients: this.getTotalIngredientsUsedFromOrder(order),
          };
        });
        this.ordersDelivered.set(res.data);
      },
      error: (err) => {
        this.errorMessage.set(err.message);
      },
    });
  }

  suscribeOrdersDelivered() {
    this._sseService.subscribeToEvent('kitchen.orders', (res) => {
      let { eventType, new: order } = res;
      if (
        eventType === 'UPDATE' &&
        order.status === ORDER_STATUS.DELIVERED &&
        Number(order.id) > this.lastOrderId()
      ) {
        order.totalIngredients = this.getTotalIngredientsUsedFromOrder(order);
        const originalDate = new Date(order.createdAt);
        const adjustedDate = new Date(originalDate.getTime() - 5 * 60 * 60 * 1000); // Resta 5 horas
        order.createdAt = adjustedDate.toISOString();
        this.lastOrderId.set(Number(order.id));
        this.ordersDelivered.update((orders) => {
          orders.unshift(order);
          return orders;
        });
      }
    });
  }

  async placeOrder() {
    if (this.orderIsProcesing()) return;
    if (this.initOrderForm.invalid) return this.showErrorsForm.set(true);

    this.orderIsProcesing.set(true);
    this.errorMessage.set('');

    const value = this.initOrderForm.getRawValue().dishes;
    const res = await firstValueFrom(this._kitchenService.placeOrder({ orders: Number(value) }));
    this.initOrderForm.reset();
    this.orderIsProcesing.set(false);

    if (res?.error) {
      return this.errorMessage.set(res.error?.message);
    }
    this.toastr.success('Orden enviada a cocina 🚀', '', {
      timeOut: 2000,
    });
    scrollIntoView('status-orders');
  }

  hasErrorsField(field: string): boolean {
    return hasErrorsFieldForm(this.initOrderForm, field, this.showErrorsForm());
  }

  /**
   * Calcula la cantidad total de cada ingrediente usado en una orden
   * @param order - Orden con listRecipes
   * @returns Objeto con el nombre del ingrediente como key y cantidad total como value
   * @example
   * // Input: order con 3 recetas que usan tomato (2), tomato (1), cheese (5)
   * // Output: { tomato: 3, cheese: 5 }
   */
  getTotalIngredientsUsedFromOrder(order: { listRecipes: any[] }) {
    const ingredientTotals = [];

    for (const recipe of order.listRecipes) {
      for (const ingredient of recipe.ingredients) {
        const name = ingredient.ingredientName;
        const quantity = ingredient.quantity;

        if (ingredientTotals[name]) {
          ingredientTotals[name] += quantity;
        } else {
          ingredientTotals[name] = quantity;
        }
      }
    }

    return ingredientTotals;
  }
}
