import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'files-upload',
    loadChildren: () => import('./files-upload/files-upload.module').then(m => m.FilesUploadModule),
  },
  {
    path: 'file-actions',
    loadChildren: () => import('./files-actions/file-actions.module').then(m => m.FileActionsModule),
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
  },
  {
    path: '',
    redirectTo: 'files-upload',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'files-upload',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { enableTracing: false }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
