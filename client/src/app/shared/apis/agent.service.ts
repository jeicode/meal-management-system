import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of, throwError, timeout } from 'rxjs';
import { TIMEOUT_ERROR } from '../../constants/error.constants';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  _http = inject(HttpClient);
  constructor() {}

  ask(text: string) {
    const url = `${environment.API_URL}/v1/agent`;
    return this._http.post<any>(url, { text }).pipe(
      timeout({
        each: 20000,
        with: () => throwError(() => TIMEOUT_ERROR),
      }),
      catchError(({ error }: any) => {
        console.error('Error en askAi:', error);
        return of({ error: { message: error.error.message } });
      }),
    );
  }
}
