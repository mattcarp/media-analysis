import { Component } from '@angular/core';

import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'ddp-tabs',
  template: `
    <ul class="nav nav-tabs">
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" class="nav-item">
        <span class="nav-link ddp-nav-link" [ngClass]="{ active: tab?.active }">
          {{tab?.tabTitle}}</span>
      </li>
    </ul>
    <ng-content></ng-content>
  `,
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  tabs: TabComponent[] = [];

  addTab(tab: TabComponent): void {
    if (this.tabs.length === 0) {
      tab.active = true;
    }
    this.tabs.push(tab);
  }

  selectTab(tab: TabComponent): void {
    this.tabs.forEach((currentTab: TabComponent) => {
      currentTab.active = false;
    });
    tab.active = true;
  }
}
