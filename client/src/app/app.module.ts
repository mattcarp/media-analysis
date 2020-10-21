import { BrowserModule } from '@angular/platform-browser';
import { InjectionToken, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HandleFilesComponent } from './handle-files/handle-files.component';
import { PlayerComponent } from './player/player.component';
import { AnalyzeVideoComponent } from './analyze-video/analyze-video.component';
import { AnalyzeAudioComponent } from './analyze-audio/analyze-audio.component';
import { ExtractMetadataComponent } from './extract-metadata/extract-metadata.component';
import { DetectBlackComponent } from './detect-black/detect-black.component';
import { LoggerService } from './services/logger.service';
import { TooltipDirective } from './directives/tooltip.directive';
import { AnalyzeImageComponent } from './analyze-image/analyze-image.component';

export const ReducerToken = new InjectionToken('Media Analysis Registered Reducers');

export function getReducers() {
  return {};
}

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
    TooltipDirective,
    AnalyzeImageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxDropzoneModule,
    StoreModule.forRoot(ReducerToken, {}),
  ],
  providers: [
    LoggerService,
    ReducerProvider,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
