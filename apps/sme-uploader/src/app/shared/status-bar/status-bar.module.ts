import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PipesModule } from '../../pipes/pipes.module';
import { StatusBarComponent } from './status-bar.component';

@NgModule({
  imports: [PipesModule, CommonModule],
  declarations: [StatusBarComponent],
  exports: [StatusBarComponent],
})
export class StatusBarModule {}
