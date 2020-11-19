import { BrowserModule } from '@angular/platform-browser';
import {
  InjectionToken,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatTabsModule } from '@angular/material/tabs';

import { environment } from '../environments/environment';
import { reducers } from './shared/store/reducers';
import { AppRoutingModule } from './app-routing.module';
import { LoggerService } from './services/logger.service';
import { HelperService } from './services/helper.service';
import { AppComponent } from './app.component';
import { UploaderComponent } from './uploader/uploader.component';
import { PlayerComponent } from './player/player.component';
import { AnalyzeVideoComponent } from './analyze-video/analyze-video.component';
import { AnalyzeAudioComponent } from './analyze-audio/analyze-audio.component';
import { ExtractMetadataComponent } from './extract-metadata/extract-metadata.component';
import { DetectBlackComponent } from './detect-black/detect-black.component';
import { AnalyzeImageComponent } from './analyze-image/analyze-image.component';
import { AnalyzeDdpModule } from './analyze-ddp/analyze-ddp.module';
import { ModalComponent } from '@app/services/modal-service/modal.component';
import { ModalService } from '@app/services/modal-service/modal.service';

export const ReducerToken = new InjectionToken(
  'Media Analysis Registered Reducers',
);

export const getReducers = (): any => {
  return reducers;
};

export const ReducerProvider = [
  { provide: ReducerToken, useFactory: getReducers },
];

@NgModule({
  declarations: [
    AppComponent,
    UploaderComponent,
    DetectBlackComponent,
    ExtractMetadataComponent,
    AnalyzeAudioComponent,
    AnalyzeVideoComponent,
    PlayerComponent,
    AnalyzeImageComponent,
    ModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(ReducerToken, {}),
    AnalyzeDdpModule,
    NoopAnimationsModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    MatTabsModule,
  ],
  providers: [LoggerService, HelperService, ModalService, ReducerProvider],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
