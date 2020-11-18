import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { LoggerModule, NGXLogger, NgxLoggerLevel } from 'ngx-logger';

import { DdpComponent } from './ddp/ddp.component';
import {
  ddpFilesFeatureKey,
  reducer as ddpFilesReducer,
} from './store/reducers/ddp.reducer';
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
import { LoggerMonitor } from './store/services';

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
    HttpClientModule,
    StoreModule.forFeature(ddpFilesFeatureKey, ddpFilesReducer),
    MatTabsModule,
    MatCardModule,
    LoggerModule.forRoot({
      colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red'],
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
  ],
  exports: [
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
})
export class AnalyzeDdpModule {
  constructor(private logger: NGXLogger) {
    this.logger.registerMonitor(new LoggerMonitor());
    this.logger.error('ERROR');
    this.logger.debug('DEBUG');
    this.logger.log('LOG');
  }
}
