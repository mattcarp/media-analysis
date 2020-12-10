import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlyrModule } from 'ngx-plyr';

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
    PlyrModule,
    MatButtonModule,
    MatExpansionModule,
  ],
  exports: [
    VideoMetadataComponent,
    VideoPlayerComponent,
    VideoValidationsComponent,
    VideoFileComponent,
  ],
})
export class AnalyzeVideoModule {}
