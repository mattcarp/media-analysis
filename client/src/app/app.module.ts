import { BrowserModule } from '@angular/platform-browser';
import { InjectionToken, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HandleFilesComponent } from './handle-files/handle-files.component';
import { PlayerComponent } from './player/player.component';
import { AnalyzeVideoComponent } from './analyze-video/analyze-video.component';
import { AnalyzeAudioComponent } from './analyze-audio/analyze-audio.component';
import { ExtractMetadataComponent } from './extract-metadata/extract-metadata.component';
import { DetectBlackComponent } from './detect-black/detect-black.component';
import { LoggerService } from './services/logger.service';
import { AnalyzeImageComponent } from './analyze-image/analyze-image.component';
import { reducers } from './shared/store/reducers';
import { DdpAnalysisModule } from './ddp-analysis/ddp-analysis.module';
import { environment } from '../environments/environment';


export const ReducerToken = new InjectionToken('Media Analysis Registered Reducers');

export const getReducers = () => {
  return reducers;
};

export const ReducerProvider = [{ provide: ReducerToken, useFactory: getReducers }];

@NgModule({
  declarations: [
    AppComponent,
    HandleFilesComponent,
    DetectBlackComponent,
    ExtractMetadataComponent,
    AnalyzeAudioComponent,
    AnalyzeVideoComponent,
    PlayerComponent,
    AnalyzeImageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(ReducerToken, {}),
    DdpAnalysisModule,
    NoopAnimationsModule,
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    MatTabsModule,
  ],
  providers: [
    LoggerService,
    ReducerProvider,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
