import { Component, inject, signal } from '@angular/core';
import { PlaceOrdersService } from '../../place-orders.service';
import { ToastrService } from 'ngx-toastr';
import { NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KitchenService } from '../../../../shared/apis/kitchen.service';
import { scrollIntoView } from '../../../../shared/utils/dom.utils';
import { hasErrorsFieldForm } from '../../../../shared/utils/form';

@Component({
  selector: 'app-manual-place-order',
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './manual-place-order.component.html',
  styleUrl: './manual-place-order.component.css',
})
export class ManualPlaceOrderComponent {
  private _kitchenService = inject(KitchenService);
  orderIsProcesing = signal(false);
  placeOrdersService = inject(PlaceOrdersService);
  toastr = inject(ToastrService);
  showErrorsForm = signal(false);
  errorMessage = signal('');
  fb = inject(FormBuilder);
  initOrderForm = this.fb.group({
    orders: [null, [Validators.required, Validators.min(1), Validators.max(15)]],
  });

  async placeOrder() {
    if (this.initOrderForm.invalid) return this.showErrorsForm.set(true);
    if (this.orderIsProcesing()) return;

    this.orderIsProcesing.set(true);
    this.errorMessage.set('');

    const value = this.initOrderForm.getRawValue().orders;
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
}
