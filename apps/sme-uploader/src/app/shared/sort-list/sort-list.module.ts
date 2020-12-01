import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SortListComponent } from './sort-list.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SortListComponent],
  exports: [SortListComponent],
})
export class SortListModule {}
