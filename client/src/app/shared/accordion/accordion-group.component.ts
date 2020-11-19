import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-accordion-group',
  template: `
    <div class="accordion-panel">
      <div (click)="toggle.emit()" class="accordion-panel-title">
        {{title}}
        <span *ngIf="!opened">[+]</span>
        <span *ngIf="opened">[–]</span>
      </div>
      <div class="accordion-panel-content" [ngClass]="{'hidden': !opened}">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionGroupComponent {
  @Input() opened = false;
  @Input() title: string;
  @Output() toggle: EventEmitter<any> = new EventEmitter<any>();
}
