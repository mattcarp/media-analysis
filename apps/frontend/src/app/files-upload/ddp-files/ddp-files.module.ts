import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { StoreModule } from '@ngrx/store';

import { DdpComponent } from './ddp/ddp.component';
import {
  ddpFilesFeatureKey,
  reducer as ddpFilesReducer,
} from './store/reducers/ddp.reducer';
import { CdtextComponent } from './cdtext/cdtext.component';
import { DdpIdComponent } from './ddpid/ddpid.component';
import { DdpmsComponent } from './ddpms/ddpms.component';
import { DdppqComponent } from './ddppq/ddppq.component';
import { GracenoteComponent } from './gracenote/gracenote.component';
import { HashesComponent } from './hashes/hashes.component';
import { ValidationsComponent } from './validations/validations.component';

@NgModule({
  declarations: [
    DdpComponent,
    CdtextComponent,
    DdpIdComponent,
    DdpmsComponent,
    DdppqComponent,
    GracenoteComponent,
    HashesComponent,
    ValidationsComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(ddpFilesFeatureKey, ddpFilesReducer),
    MatButtonModule,
    MatExpansionModule,
  ],
  exports: [
    DdpComponent,
    CdtextComponent,
    DdpIdComponent,
    DdpmsComponent,
    DdppqComponent,
    GracenoteComponent,
    HashesComponent,
    ValidationsComponent,
  ],
})
export class DdpFilesModule {}
