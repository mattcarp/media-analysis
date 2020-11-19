import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';
import { AccordionGroupComponent } from './accordion-group.component';

@Component({
  selector: 'app-accordion',
  template: '<ng-content></ng-content>',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements AfterContentInit {
  @Input() firstOpened: boolean;
  @ContentChildren(AccordionGroupComponent)

  groups: QueryList<AccordionGroupComponent>;

  ngAfterContentInit(): void {
    // Set active to first element
    this.groups.toArray()[0].opened = this.firstOpened;
    this.groups.toArray().forEach((g: AccordionGroupComponent) => {
      g.toggle.subscribe(() => {
        this.openGroup(g);
      });
    });
  }

  openGroup(group): void {
    this.groups.toArray().forEach((g: AccordionGroupComponent) => g.opened = false);
    group.opened = true;
  }
}
