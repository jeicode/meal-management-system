import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SERVER_ERROR, TIMEOUT_ERROR } from '../../constants/error.constants';

@Injectable({
  providedIn: 'root',

})
export class KitchenService {

  private _http = inject(HttpClient)

  getRecipes(): Observable<any> {
    const url = `${environment.API_URL}/v1/kitchen/recipes`
    return this._http.get<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR)
      }),
      catchError(err => {
        return of(SERVER_ERROR);
      })
    )
  }


  placeOrder(orders: number): Observable<any> {
    const url = `${environment.API_URL}/v1/kitchen/order?dishes=${orders}`
    return this._http.get<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR)
      }),
      catchError(err => {
        return of(SERVER_ERROR);
      })
    )
  }

  getOrders(body:Record<string, any> = {}): Observable<any> {
    const url = `${environment.API_URL}/v1/kitchen/orders`
    return this._http.post<any>(url, body).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR)
      }),
      catchError(err => {
        return of(SERVER_ERROR);
      })
    )
  }


}
