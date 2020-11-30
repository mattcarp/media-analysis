import { Injectable } from '@angular/core';

import { ModalComponent } from './modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modals: Array<ModalComponent>;

  constructor() {
    this.modals = [];
  }

  close(modalId: string): void {
    const modal = this.findModal(modalId);

    if (modal) {
      setTimeout(() => {
        modal.isOpen = false;
      }, 250);
    }
  }

  findModal(modalId: string): ModalComponent {
    for (const modal of this.modals) {
      if (modal.modalId === modalId) {
        return modal;
      }
    }

    return null;
  }

  openModal(modalId: string): void {
    const modal = this.findModal(modalId);

    if (modal) {
      setTimeout(() => {
        modal.isOpen = true;
      }, 250);
    }
  }

  registerModal(newModal: ModalComponent): void {
    const modal = this.findModal(newModal.modalId);

    if (modal) {
      this.modals.splice(this.modals.indexOf(modal), 1);
    }

    this.modals.push(newModal);
  }
}
