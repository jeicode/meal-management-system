import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../shared/apis/settings.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  settingsService = inject(SettingsService);
  loadingDelete = signal(false);
  showConfirmation = false;
  showSuccess = false;
  confirmText = '';

  cancelDelete() {
    this.showConfirmation = false;
    this.confirmText = '';
  }

  async confirmDelete() {
    if (this.confirmText === 'ELIMINAR') {
      this.loadingDelete.set(true);
      const [orders, inventory] = await Promise.all([
        firstValueFrom(this.settingsService.deleteData()),
        firstValueFrom(this.settingsService.deleteData()),
      ]);
      if (orders.error || inventory.error) {
        this.showConfirmation = false;
        this.showSuccess = true;
        this.confirmText = '';
        this.loadingDelete.set(false);
        return alert('Error al eliminar datos:');
      }
      this.showConfirmation = false;
      this.showSuccess = true;
      this.confirmText = '';
      this.loadingDelete.set(false);
    }
  }

  closeSuccess() {
    this.showSuccess = false;
  }
}
