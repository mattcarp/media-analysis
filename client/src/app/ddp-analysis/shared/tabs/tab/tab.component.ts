import { Component, OnInit, Input } from '@angular/core';

import { TabsComponent } from '../tabs.component';

@Component({
  selector: 'ddp-tab',
  template: `
    <div [hidden]="!active">
     <ng-content></ng-content>
    </div>
  `
})
export class TabComponent implements OnInit {
  @Input() tabTitle;
  active: boolean;

  constructor(tabs: TabsComponent) {
    tabs.addTab(this);
  }

  ngOnInit() {
    this.active = this.active || false;
  }
}
