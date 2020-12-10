import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FileActionsRoutingModule } from './file-actions-routing.module';
import { NavModule } from '../shared/nav/nav.module';
import { FileActionsComponent } from './file-actions.component';

@NgModule({
  declarations: [FileActionsComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FileActionsRoutingModule,
    NavModule,
  ],
})
export class FileActionsModule {}
