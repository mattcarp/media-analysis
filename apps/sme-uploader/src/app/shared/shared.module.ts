import { NgModule } from '@angular/core';

import { DeleteModalModule } from './delete-modal/delete-modal.module';

@NgModule({
  imports: [DeleteModalModule],
  exports: [DeleteModalModule],
  declarations: [],
  providers: [],
})
export class SharedModule {}
