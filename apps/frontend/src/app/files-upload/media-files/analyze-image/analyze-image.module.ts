import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

import { ImageFileComponent } from './image-file/image-file.component';
import { ImageValidationsComponent } from './image-validations/image-validations.component';
import { ImageExifComponent } from './image-exif/image-exif.component';
import { ImageMetadataComponent } from './image-metadata/image-metadata.component';

@NgModule({
  declarations: [
    ImageFileComponent,
    ImageValidationsComponent,
    ImageExifComponent,
    ImageMetadataComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  exports: [
    ImageFileComponent,
    ImageValidationsComponent,
    ImageExifComponent,
    ImageMetadataComponent,
  ],
})
export class AnalyzeImageModule {}
