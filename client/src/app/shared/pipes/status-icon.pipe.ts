import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'statusIcon' })
export class StatusIconPipe implements PipeTransform {
  transform(status: string): string {
    const statusMap: {[key: string]: string} = {
      'DELIVERED': '✅ Entregado',
      'PREPARING': '⏳ Preparando',
      'WAITING_FOR_INGREDIENTS': '🛒 Esperando ingredientes'
    };
    return statusMap[status] || status;
  }
}
