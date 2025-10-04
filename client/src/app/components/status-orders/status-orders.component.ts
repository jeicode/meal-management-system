import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IOrderHistory } from '../../interfaces/order-history.interface';
import { ORDER_STATUS } from '../../constants/kitchen.constants';
import { NgClass } from '@angular/common';
import { StatusIconPipe } from '../../shared/pipes/status-icon.pipe';
import { KitchenService } from '../../shared/apis/kitchen.service';
import { SSEService } from '../../shared/apis/sse.service';

@Component({
  selector: 'app-status-orders',
  imports: [
    NgClass,
    StatusIconPipe
  ],
  templateUrl: './status-orders.component.html',
  styleUrl: './status-orders.component.css'
})
export class StatusOrdersComponent implements OnInit, OnDestroy {

  private _kitchenService = inject(KitchenService);
  private _sseService = inject(SSEService);
  orderStatus = ORDER_STATUS

  errorMessage = signal('')
  pendingOrders = signal<IOrderHistory[]>([])

  ngOnInit(): void {
    this.getOrdersPendingOrWaiting()
    this.suscribePendingOrders()
  }

  ngOnDestroy(): void {
  }

  getOrdersPendingOrWaiting(){
    let query = `where.status.in=${ORDER_STATUS.PREPARING},${ORDER_STATUS.WAITING_FOR_INGREDIENTS}`
    query += `&orderBy.createdAt=asc`
    this._kitchenService.getOrders(query).subscribe({
      next: (res) => {
        if(res.error) return this.errorMessage.set(res.error.message)
        this.pendingOrders.set(res.data)
      },
      error: (err) => {
        this.errorMessage.set(err.message)
      }
    })
  }

  suscribePendingOrders() {
    this._sseService.subscribeToEvent('kitchen.orders', (res) => {
      const {eventType, new: order} = res

      if(eventType === 'INSERT'){
        this.pendingOrders.update((orders) => {
          orders.push(order)
          return orders
        })
      }
      else if(eventType === 'UPDATE'){
        if(order.status === ORDER_STATUS.DELIVERED){
          return this.pendingOrders.update((orders) => {
            const index = orders.findIndex((o) => o.id === order.id)
            if (index !== -1) {
              orders.splice(index, 1)
            }
            return orders
          })
        }
        this.pendingOrders.update((orders) => {
          const index = orders.findIndex((o) => o.id === order.id)
          if (index !== -1) {
            orders[index] = order
          }
          return orders
        })
      }
    })
  }

  orderIsPreparing(order: IOrderHistory): boolean {
    return order.status === ORDER_STATUS.PREPARING
  }


}
