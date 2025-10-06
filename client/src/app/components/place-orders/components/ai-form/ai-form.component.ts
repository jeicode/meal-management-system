import { Component, inject } from '@angular/core';
import { PlaceOrdersService } from '../../place-orders.service';

@Component({
  selector: 'ai-form',
  imports: [],
  templateUrl: './ai-form.component.html',
  styleUrl: './ai-form.component.css',
})
export class AiFormComponent {
  placeOrdersService = inject(PlaceOrdersService);
}
