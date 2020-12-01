import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DeleteModalComponent } from './delete-modal.component';

@NgModule({
  imports: [CommonModule],
  declarations: [DeleteModalComponent],
  exports: [DeleteModalComponent],
})
export class DeleteModalModule {}
