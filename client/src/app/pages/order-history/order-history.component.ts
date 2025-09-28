import { Component, inject, OnInit, signal } from '@angular/core';
import type { IOrderHistory } from "../../interfaces/order-history.interface";
import { StatusIconPipe } from '../../shared/pipes/status-icon.pipe';
import { DatePipe } from '@angular/common';
import { KitchenService } from '../../shared/apis/kitchen.service';

@Component({
  selector: 'app-order-history',
  imports: [
    StatusIconPipe,
    DatePipe
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {

  loadingData = signal(false);
  private _kitchenService = inject(KitchenService);

  ordersHistory = signal<IOrderHistory[]>([])


  ngOnInit(): void {
    this.getOrdersHistory();
  }

  refresh() {
    this.loadingData.set(true)
    setTimeout(() => {
       this.getOrdersHistory();
    }, 1100);
  }


  getOrdersHistory() {
    this.loadingData.set(true)
    this._kitchenService.getOrders().subscribe({
      next: (response) => {
        this.loadingData.set(false)
        if (response.error){return}
        this.ordersHistory.set(response.data);
      },
      error: (error) => {
        this.loadingData.set(false)
        alert(error.message)
      }
    })
    
  }

}
