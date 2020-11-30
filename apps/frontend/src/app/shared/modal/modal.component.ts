import { Component, HostListener, Input, OnInit } from '@angular/core';

import { ModalService } from './modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.scss'],
})

export class ModalComponent implements OnInit {
  @Input() closeBtn: boolean;
  @Input() modalId: string;
  @Input() modalTitle: string;
  isOpen = false;

  constructor(private modalService: ModalService) {}

  @HostListener('document:keyup', ['$event']) keyup(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.modalService.close(this.modalId);
    }
  }

  ngOnInit(): void {
    this.modalService.registerModal(this);
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
