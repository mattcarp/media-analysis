import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import {
  mediaFilesFeatureKey,
  reducer as mediaFilesReducer,
} from './store/reducers/media-files.reducer';
import { AccordionModule } from '../shared/accordion/accordion.module';
import { AnalyzeImageModule } from './analyze-image/analyze-image.module';
import { AnalyzeAudioModule } from './analyze-audio/analyze-audio.module';
import { AnalyzeVideoModule } from './analyze-video/analyze-video.module';
import { DetectBlackComponent } from './detect-black/detect-black.component';
import { MediaFilesComponent } from './media-files.component';

@NgModule({
  declarations: [
    DetectBlackComponent,
    MediaFilesComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(mediaFilesFeatureKey, mediaFilesReducer),
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
    DetectBlackComponent,
    MediaFilesComponent,
    AnalyzeImageModule,
    AnalyzeAudioModule,
    AnalyzeVideoModule,
  ],
})
export class MediaFilesModule {}
