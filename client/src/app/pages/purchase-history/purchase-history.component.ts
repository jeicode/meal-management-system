import { Component, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { InventoryService } from '../../shared/apis/inventory.service';

@Component({
  selector: 'app-purchase-history',
  imports: [
    TitleCasePipe,
    DatePipe
  ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css'
})
export class PurchaseHistoryComponent {

   loadingData = signal(false);
    private _inventoryService = inject(InventoryService);
    pagination = signal({
      take: 20,
      skip: 0,
      total: 0,
      remaining: 0
    })
  
    purchaseHistory = signal<any[]>([])
  
    ngOnInit(): void {
      this.getPurchaseHistory();
    }
  
    refresh() {
      this.loadingData.set(true)
      setTimeout(() => {
        this.getPurchaseHistory();
      }, 1100);
    }
  
  
    getPurchaseHistory() {
      const query = `?take=${this.pagination().take}&skip=${this.pagination().skip}`
      this.loadingData.set(true)
      this._inventoryService.getPurchaseHistory(query).subscribe({
        next: (response) => {
          if (response.error) return this.loadingData.set(false)
          this.loadingData.set(false)
          this.purchaseHistory.set(response.data);
          this.pagination.set({
            take: response.pagination.take,
            skip: response.pagination.skip,
            total: response.pagination.total,
            remaining: response.pagination.remaining
          })
        },
        error: (error:any) => {
          this.loadingData.set(false)
          alert(error.message)
        }
      })
      
    }

    paginateData(type: 'next' | 'prev') {
      if (type === 'next') {
        this.pagination.update((prev) => ({
          ...prev,
          skip: prev.skip + prev.take
        }))
      } else {
        this.pagination.update((prev) => ({
          ...prev,
          skip: prev.skip - prev.take
        }))
      }
      this.getPurchaseHistory();
    }
  

}
