import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TIMEOUT_ERROR } from '../../constants/error.constants';

type paramsPlaceOrder = {
  orders: number;
  presetRecipesIds?: string;
};
@Injectable({
  providedIn: 'root',
})
export class KitchenService {
  private _http = inject(HttpClient);

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

  placeOrder({ orders, presetRecipesIds }: paramsPlaceOrder): Observable<any> {
    const queries = [];
    let url = `${environment.API_URL}/v1/kitchen/order`;
    if (orders) queries.push(`dishes=${orders}`);
    if (presetRecipesIds) queries.push(`presetRecipesIds=${presetRecipesIds}`);
    if (queries.length > 0) {
      url += '?' + queries.join('&');
    }
    return this._http.post(url, {}).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        return of({ error: { message: error.error.message } });
      }),
    );
  }

  getOrders(query: string = ''): Observable<any> {
    const url = `${environment.API_URL}/v1/kitchen/orders?${query}`;
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
