import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusOrdersComponent } from '../../components/status-orders/status-orders.component';
import { StatusInventoryComponent } from '../../components/status-inventory/status-inventory.component';
import { inject } from '@angular/core';
import { KitchenService } from '../../shared/apis/kitchen.service';
import { PlaceOrdersComponent } from '../../components/place-orders/place-orders.component';
@Component({
  selector: 'app-home',
  imports: [
    PlaceOrdersComponent,
    StatusOrdersComponent,
    StatusInventoryComponent,
    ReactiveFormsModule,
  ],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  _kitchenService = inject(KitchenService);
}
