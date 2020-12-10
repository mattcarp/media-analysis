import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AboutRoutingModule } from './about-routing.module';
import { NavModule } from '../shared/nav/nav.module';
import { AboutComponent } from './about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    AboutRoutingModule,
    NavModule,
  ],
})
export class AboutModule { }
