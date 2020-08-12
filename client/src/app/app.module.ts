import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { PlayerComponent } from './player/player.component';
import { ValidateFormatComponent } from './validate-format/validate-format.component';
import { AnalyzeAudioComponent } from './analyze-audio/analyze-audio.component';
import { ExtractMetadataComponent } from './extract-metadata/extract-metadata.component';
import { DetectBlackComponent } from './detect-black/detect-black.component';
import { HandleFilesComponent } from './handle-files/handle-files.component';
import { HistoryFilesComponent } from './history-files/history-files.component';

@NgModule({
  declarations: [
    AppComponent,
    DetectBlackComponent,
    HandleFilesComponent,
    ExtractMetadataComponent,
    AnalyzeAudioComponent,
    ValidateFormatComponent,
    PlayerComponent,
    UploadFileComponent,
    HistoryFilesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxDropzoneModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
