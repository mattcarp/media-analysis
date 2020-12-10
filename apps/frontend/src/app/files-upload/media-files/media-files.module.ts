import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import {
  mediaFilesFeatureKey,
  reducer as mediaFilesReducer,
} from './store/media-files.reducer';
import { AnalyzeImageModule } from './analyze-image/analyze-image.module';
import { AnalyzeAudioModule } from './analyze-audio/analyze-audio.module';
import { AnalyzeVideoModule } from './analyze-video/analyze-video.module';
import { MediaFilesEffects } from './store/media-files.effects';
import { MediaFilesComponent } from './media-files.component';

@NgModule({
  declarations: [
    MediaFilesComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(mediaFilesFeatureKey, mediaFilesReducer),
    EffectsModule.forFeature([MediaFilesEffects]),
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
