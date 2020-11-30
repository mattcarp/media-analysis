import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AccordionComponent } from './accordion.component';
import { AccordionGroupComponent } from './accordion-group.component';

@NgModule({
  declarations: [
    AccordionComponent,
    AccordionGroupComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    AccordionComponent,
    AccordionGroupComponent,
  ],
})
export class AccordionModule {}
