import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';

import { AccordionGroupComponent } from './accordion-group.component';

@Component({
  selector: 'app-accordion',
  template: '<ng-content></ng-content>',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements AfterContentInit {
  @Input() isFirstOpened: boolean;
  @ContentChildren(AccordionGroupComponent)
  groups: QueryList<AccordionGroupComponent>;

  ngAfterContentInit(): void {
    // Set active to first element
    this.groups.toArray()[0].opened = this.isFirstOpened;
    this.groups.toArray().forEach((g: AccordionGroupComponent) => {
      let isOpen = false;
      g.toggle.subscribe(() => {
        isOpen = !isOpen;
        this.toggleGroup(g, isOpen);
      });
    });
  }

  toggleGroup(group: AccordionGroupComponent, isOpen: boolean): void {
    this.groups.toArray().forEach((g: AccordionGroupComponent) => g.opened = false);
    group.opened = isOpen;
  }
}
