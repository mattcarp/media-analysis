import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import {
  ExtractFrameEffects,
  extractFrameFeatureKey,
  reducer as extractFrameReducer,
} from './store';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    StoreModule.forFeature(extractFrameFeatureKey, extractFrameReducer),
    EffectsModule.forFeature([ExtractFrameEffects]),
  ],
})
export class ExtractFrameModule {}
