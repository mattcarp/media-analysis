import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FileActionsComponent } from './file-actions.component';

const routes: Routes = [
  {
    path: '',
    component: FileActionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileActionsRoutingModule {}
