import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',

})
export class SSEService {

  source!: EventSource;

  suscribeToSSE(): EventSource {
    if (this.source) return this.source;
    const url = `${environment.API_URL}/v1/sse`
    this.source = new EventSource(url);
    this.source.onerror = (error) => {
      console.error('Error en conexión SSE', error);
      this.reconnectSSE();
    }
    return this.source;
  }


  // Reintentar reconectar
  private reconnectSSE(): void {
    setTimeout(() => {
      if (!this.source) {
        this.suscribeToSSE();
      }
    }, 8000);
  }


   // Función para suscribirse a un evento específico de SSE
   subscribeToEvent(eventName: string, callback: (data: any) => void): void {
    if (this.source) {
      this.source.addEventListener(eventName, (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        callback(data);
      });
    }
  }


}

