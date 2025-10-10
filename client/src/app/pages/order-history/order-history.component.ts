import { Component, inject, OnInit, signal } from '@angular/core';
import type { IOrderHistory } from '../../interfaces/order-history.interface';
import { StatusIconPipe } from '../../shared/pipes/status-icon.pipe';
import { DatePipe } from '@angular/common';
import { KitchenService } from '../../shared/apis/kitchen.service';

@Component({
  selector: 'app-order-history',
  imports: [StatusIconPipe, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit {
  loadingData = signal(false);
  private _kitchenService = inject(KitchenService);

  pagination = signal({
    take: 6,
    skip: 0,
    total: 0,
    remaining: 0,
  });
  ordersHistory = signal<IOrderHistory[]>([]);

  ngOnInit(): void {
    this.getOrdersHistory();
  }

  refresh() {
    this.loadingData.set(true);
    setTimeout(() => {
      this.getOrdersHistory();
    }, 1100);
  }

  paginateData(type: 'next' | 'prev') {
    if (type === 'next') {
      this.pagination.update((prev) => ({
        ...prev,
        skip: prev.skip + prev.take,
      }));
    } else {
      this.pagination.update((prev) => ({
        ...prev,
        skip: prev.skip - prev.take,
      }));
    }
    this.getOrdersHistory();
  }

  getOrdersHistory() {
    this.loadingData.set(true);
    const query = `take=${this.pagination().take}&skip=${this.pagination().skip}&orderBy.id=desc`;

    this._kitchenService.getOrders(query).subscribe({
      next: (response) => {
        this.loadingData.set(false);
        if (response.error) {
          return;
        }
        this.ordersHistory.set(response.data);
        console.log(response);

        this.pagination.set({
          take: response.pagination.take,
          skip: response.pagination.skip,
          total: response.pagination.total,
          remaining: response.pagination.remaining,
        });
      },
      error: (error) => {
        this.loadingData.set(false);
        alert(error.message);
      },
    });
  }
}
