import { Component, input } from '@angular/core';
import { IOrderHistory } from '../../../../interfaces/order-history.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-delivered',
  imports: [DatePipe],
  templateUrl: './order-delivered.component.html',
})
export class OrderDeliveredComponent {
  data = input.required<IOrderHistory>();
  Object = Object;
}
