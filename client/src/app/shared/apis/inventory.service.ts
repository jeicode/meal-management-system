import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TIMEOUT_ERROR } from '../../constants/error.constants';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private _http = inject(HttpClient);

  getIngredients(): Observable<any> {
    const url = `${environment.API_URL}/v1/inventory/ingredients`;
    return this._http.get<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        return of({ error: { message: error.error.message } });
      }),
    );
  }

  getPurchaseHistory(query: string = ''): Observable<any> {
    const url = `${environment.API_URL}/v1/inventory/purchase-history${query}`;
    return this._http.get<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        return of({ error: { message: error.error.message } });
      }),
    );
  }

  getRecipes(): Observable<any> {
    const url = `${environment.API_URL}/v1/kitchen/recipes`;
    return this._http.get<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        return of({ error: { message: error.error.message } });
      }),
    );
  }
}
