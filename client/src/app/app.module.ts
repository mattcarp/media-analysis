import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

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
  imports: [BrowserModule, AppRoutingModule],
  providers: [LoggerService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
