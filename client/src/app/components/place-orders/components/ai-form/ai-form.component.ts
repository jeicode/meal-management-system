import { Component, inject, signal } from '@angular/core';
import { PlaceOrdersService } from '../../place-orders.service';
import { AgentService } from '../../../../shared/apis/agent.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ai-form',
  imports: [FormsModule],
  templateUrl: './ai-form.component.html',
  styleUrl: './ai-form.component.css',
})
export class AiFormComponent {
  messageSent = signal('');
  placeOrdersService = inject(PlaceOrdersService);
  agentService = inject(AgentService);
  prompt = signal('');
  responseAi = signal('');
  loadingResponseAi = signal(false);
  errorMessage = signal('');

  askAi() {
    if (!this.prompt().trim()) return this.errorMessage.set('Por favor, ingresa un mensaje');
    this.errorMessage.set('');
    this.messageSent.set(this.prompt());
    this.loadingResponseAi.set(true);
    this.responseAi.set('');
    this.agentService.ask(this.prompt()).subscribe({
      next: (res) => {
        this.responseAi.set(res.data);
      },
      error: (err) => {
        this.responseAi.set(err.error?.message);
      },
      complete: () => {
        this.loadingResponseAi.set(false);
        this.prompt.set('');
      },
    });
  }
}
