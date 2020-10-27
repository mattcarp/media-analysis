import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { DdpComponent } from './ddp/ddp.component';
import { ddpFilesFeatureKey, ddpFilesReducer } from './store/reducers/ddp.reducer';

@NgModule({
  declarations: [DdpComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature(ddpFilesFeatureKey, ddpFilesReducer),
  ],
})
export class DdpAnalysisModule {}
