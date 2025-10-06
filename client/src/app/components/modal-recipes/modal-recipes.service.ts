import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ModalRecipesService {
  open = signal(false);
  $open = toObservable(this.open);
}
