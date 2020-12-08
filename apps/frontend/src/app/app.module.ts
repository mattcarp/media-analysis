import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { reducers } from './store/reducers';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MediaFilesModule } from './media-files/media-files.module';
import { DdpFilesModule } from './ddp-files/ddp-files.module';
import { ModalComponent } from './shared/modal/modal.component';
import { UploaderComponent } from './uploader/uploader.component';
import { ModalAboutComponent } from './modal-about/modal-about.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    UploaderComponent,
    ModalAboutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MediaFilesModule,
    DdpFilesModule,
    NoopAnimationsModule,
    StoreModule.forRoot(reducers, {}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25, logOnly: environment.production
    }),
    EffectsModule.forRoot([]),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
