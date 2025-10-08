import { Component, inject, signal } from '@angular/core';
import { PlaceOrdersService } from '../../place-orders.service';
import { AgentService } from '../../../../shared/apis/agent.service';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';

interface ChatHistory {
  role: 'user' | 'model';
  message: string;
}
@Component({
  selector: 'ai-form',
  imports: [FormsModule, MarkdownComponent],
  templateUrl: './ai-form.component.html',
  styleUrl: './ai-form.component.css',
})
export class AiFormComponent {
  messageSent = signal('');
  historyCycles = signal<number>(0);
  placeOrdersService = inject(PlaceOrdersService);
  agentService = inject(AgentService);
  prompt = signal('');
  responseAi = signal('');
  loadingResponseAi = signal(false);
  errorMessage = signal('');
  chatHistory = signal<ChatHistory[]>([]);

  askAi(customPrompt?: string) {
    if (!this.prompt().trim() && !customPrompt)
      return this.errorMessage.set('Por favor, ingresa un mensaje');
    if (this.historyCycles() > 3) {
      this.chatHistory.set([]);
      this.historyCycles.set(0);
    }
    this.errorMessage.set('');
    const _prompt = customPrompt || this.prompt();
    this.messageSent.set(_prompt);
    this.loadingResponseAi.set(true);
    this.responseAi.set('');
    const instructions = this.getInstructionsAgentHistory();
    const fullPrompt = instructions + _prompt;
    this.prompt.set('');
    this.agentService.ask(fullPrompt).subscribe({
      next: (res) => {
        if (res.error) {
          this.responseAi.set(res.error?.message);
          return;
        }
        this.responseAi.set(res.data);
      },
      error: (err) => {
        console.error('Error en askAi:', err);
        this.responseAi.set(err.error?.message);
      },
      complete: () => {
        this.loadingResponseAi.set(false);
        this.chatHistory.update((prev) => [...prev, { role: 'user', message: this.messageSent() }]);
        this.chatHistory.update((prev) => [...prev, { role: 'model', message: this.responseAi() }]);
      },
    });
  }

  getInstructionsAgentHistory() {
    if (this.chatHistory().length == 0) return '';
    this.historyCycles.update((prev) => prev + 1);
    let text =
      'Usa el historial de conversación (que se presenta a continuación) como contexto para tu respuesta:\n\n';
    this.chatHistory().forEach((message) => {
      const role = message.role === 'user' ? 'User' : 'Assistant';
      text += `${role}: ${message.message}\n\n`;
    });
    return text;
  }
}
