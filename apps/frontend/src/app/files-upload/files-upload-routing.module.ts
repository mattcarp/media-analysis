import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FilesUploadComponent } from './files-upload.component';

const routes: Routes = [
  {
    path: '',
    component: FilesUploadComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilesUploadRoutingModule {}
