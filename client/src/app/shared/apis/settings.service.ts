import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of, throwError, timeout } from 'rxjs';
import { TIMEOUT_ERROR } from '../../constants/error.constants';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  _http = inject(HttpClient);
  constructor() {}

  deleteData() {
    const url = `${environment.API_URL}/v1/settings/delete-data`;
    return this._http.delete<any>(url).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        console.error('Error en deleteData:', error);
        return of({ error: { message: error.error.message } });
      }),
    );
  }
}
