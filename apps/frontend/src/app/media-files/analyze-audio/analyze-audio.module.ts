import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from '../../shared/accordion/accordion.module';
import { AudioFileComponent } from './audio-file/audio-file.component';
import { AudioMetadataComponent } from './audio-metadata/audio-metadata.component';
import { AudioValidationsComponent } from './audio-validations/audio-validations.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';

@NgModule({
  declarations: [
    AudioFileComponent,
    AudioMetadataComponent,
    AudioValidationsComponent,
    AudioPlayerComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AccordionModule,
  ],
  exports: [
    AudioFileComponent,
    AudioMetadataComponent,
    AudioValidationsComponent,
    AudioPlayerComponent,
  ],
})
export class AnalyzeAudioModule {}
