import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { FilesUploadRoutingModule } from './files-upload-routing.module';
import { FilesUploadComponent } from './files-upload.component';

import { MediaFilesModule } from './media-files/media-files.module';
import { UploaderComponent } from './uploader/uploader.component';
import { NavModule } from '../shared/nav/nav.module';
import { DdpFilesModule } from './ddp-files/ddp-files.module';

@NgModule({
  declarations: [
    FilesUploadComponent,
    UploaderComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FilesUploadRoutingModule,
    MediaFilesModule,
    DdpFilesModule,
    NavModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FilesUploadModule { }
