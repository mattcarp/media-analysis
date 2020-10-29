import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { DdpComponent } from './ddp/ddp.component';
import { ddpFilesFeatureKey, ddpFilesReducer } from './store/reducers/ddp.reducer';
import { CdtextComponent } from './cdtext/cdtext.component';
import { TabComponent } from './shared/tabs/tab/tab.component';
import { TabsComponent } from './shared/tabs/tabs.component';
import { TooltipComponent } from './shared/tooltip/tooltip.component';
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
    TabComponent,
    TabsComponent,
    TooltipComponent,
    DdpIdComponent,
    DdpmsComponent,
    DdppqComponent,
    GracenoteComponent,
    HashesComponent,
    ValidationsComponent,
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature(ddpFilesFeatureKey, ddpFilesReducer),
  ],
})
export class DdpAnalysisModule {}
