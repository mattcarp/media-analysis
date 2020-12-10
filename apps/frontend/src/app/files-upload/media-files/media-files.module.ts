import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { StoreModule } from '@ngrx/store';

import {
  mediaFilesFeatureKey,
  reducer as mediaFilesReducer,
} from './store/media-files.reducer';
import { AnalyzeImageModule } from './analyze-image/analyze-image.module';
import { AnalyzeAudioModule } from './analyze-audio/analyze-audio.module';
import { AnalyzeVideoModule } from './analyze-video/analyze-video.module';
import { MediaFilesComponent } from './media-files.component';

@NgModule({
  declarations: [
    MediaFilesComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(mediaFilesFeatureKey, mediaFilesReducer),
    MatButtonModule,
    MatExpansionModule,
    AnalyzeImageModule,
    AnalyzeAudioModule,
    AnalyzeVideoModule,
  ],
  exports: [
    MediaFilesComponent,
    AnalyzeImageModule,
    AnalyzeAudioModule,
    AnalyzeVideoModule,
  ],
})
export class MediaFilesModule {}
