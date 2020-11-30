import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from '../../shared/accordion/accordion.module';
import { VideoMetadataComponent } from './video-metadata/video-metadata.component';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { VideoValidationsComponent } from './video-validations/video-validations.component';
import { VideoFileComponent } from './video-file/video-file.component';

@NgModule({
  declarations: [
    VideoMetadataComponent,
    VideoPlayerComponent,
    VideoValidationsComponent,
    VideoFileComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AccordionModule,
  ],
  exports: [
    VideoMetadataComponent,
    VideoPlayerComponent,
    VideoValidationsComponent,
    VideoFileComponent,
  ],
})
export class AnalyzeVideoModule {}
