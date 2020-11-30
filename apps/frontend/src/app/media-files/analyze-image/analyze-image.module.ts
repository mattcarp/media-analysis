import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from '../../shared/accordion/accordion.module';
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
    AccordionModule,
  ],
  exports: [
    ImageFileComponent,
    ImageValidationsComponent,
    ImageExifComponent,
    ImageMetadataComponent,
  ],
})
export class AnalyzeImageModule {}
