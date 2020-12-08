import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import {
  mediaFilesFeatureKey,
  reducer as mediaFilesReducer,
} from './store/media-files.reducer';
import { AccordionModule } from '../shared/accordion/accordion.module';
import { AnalyzeImageModule } from './analyze-image/analyze-image.module';
import { AnalyzeAudioModule } from './analyze-audio/analyze-audio.module';
import { AnalyzeVideoModule } from './analyze-video/analyze-video.module';
import { MediaFilesComponent } from './media-files.component';
import { MediaFilesEffects } from './store/media-files.effects';

@NgModule({
  declarations: [
    MediaFilesComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(mediaFilesFeatureKey, mediaFilesReducer),
    EffectsModule.forFeature([MediaFilesEffects]),
    LoggerModule.forRoot({
      colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red'],
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    AccordionModule,
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
