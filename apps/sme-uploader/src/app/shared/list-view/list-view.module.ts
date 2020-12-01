import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ListViewComponent } from './list-view.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ListViewComponent],
  exports: [ListViewComponent],
})
export class ListViewModule {}
