import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PlaceOrdersService {
  mode = signal<'tap' | 'ai' | 'manual'>('tap');
}
