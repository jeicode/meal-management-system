import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PlaceOrdersComponent } from '../../components/place-orders/place-orders.component';
import { StatusOrdersComponent } from '../../components/status-orders/status-orders.component';
import { StatusInventoryComponent } from '../../components/status-inventory/status-inventory.component';

@Component({
  selector: 'app-home',
  imports: [
    PlaceOrdersComponent,
    StatusOrdersComponent,
    StatusInventoryComponent, 
    ReactiveFormsModule
  ],
  providers: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent  {

}
