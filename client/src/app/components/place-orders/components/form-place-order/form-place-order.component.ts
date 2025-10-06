import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AiFormComponent } from '../ai-form/ai-form.component';
import { PlaceOrdersService } from '../../place-orders.service';
import { ManualPlaceOrderComponent } from '../manual-place-order/manual-place-order.component';

@Component({
  selector: 'app-form-place-order',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    AiFormComponent,
    ManualPlaceOrderComponent,
  ],
  templateUrl: './form-place-order.component.html',
  styleUrl: './form-place-order.component.css',
})
export class FormPlaceOrderComponent {
  // Estados principales
  placeOrdersService = inject(PlaceOrdersService);
}
