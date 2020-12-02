import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { validationsRules } from './validations-rules.constants';
import { ValidationState } from '../models';
import {
  setErrorAnalysisIds,
  setSuccessAnalysisIds,
  setValidationsState, } from '../actions/media-files.actions';
import {
  selectErrorAnalysisIds,
  selectSuccessAnalysisIds,
} from '../selectors/media-files.selectors';
import { MediaFilesState } from '../reducers/media-files.reducer';
import { MediaFilesService } from './media-files.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationsImageService implements OnDestroy {
  validations: any[] = [];
  validationsRules = validationsRules.imageStream[0];
  validationState: ValidationState[] = [];
  successAnalysisIds: string[] = [];
  errorAnalysisIds: string[] = [];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private mediaFileService: MediaFilesService,
    private store: Store<MediaFilesState>,
    private logger: NGXLogger,
  ) {
    this.store.pipe(
      select(selectSuccessAnalysisIds),
      takeUntil(this.destroy$),
    ).subscribe((successAnalysisIds: []) => this.successAnalysisIds = successAnalysisIds);

    this.store.pipe(
      select(selectErrorAnalysisIds),
      takeUntil(this.destroy$),
    ).subscribe((errorAnalysisIds: []) => this.errorAnalysisIds = errorAnalysisIds);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  validate(fileId: string, data: {analysis; error}): void {
    if (data.analysis) {
      const analysisObj = JSON.parse(data.analysis);
      const streams: any = analysisObj.streams;
      const format: any = analysisObj.format;
      let videoStream: any;

      this.validations = [];

      if (streams && streams.length) {
        streams.forEach((stream) => {
          if (stream.codec_type === 'video') {
            videoStream = stream;
          }
        });
      }

      console.log(
        `%c Hey what's the video stream in image?`,
        'color: orange',
      );
      console.log(videoStream);

      if (videoStream) {
        this.validations.push({
          name: 'Codec',
          value: videoStream.codec_long_name,
          success: this.validationsRules.codecs.indexOf(videoStream.codec_name) > -1,
          message: this.validationsRules.codecsMessage,
        });

        this.validations.push({
          name: 'Width',
          value: videoStream.width,
          success: videoStream.width >= this.validationsRules.width[0] &&
            this.validationsRules.width[1] >= videoStream.width,
          message: this.validationsRules.widthMessage,
        });

        this.validations.push({
          name: 'Height',
          value: videoStream.height,
          success: videoStream.height >= this.validationsRules.height[0] &&
            this.validationsRules.height[1] >= videoStream.height,
          message: this.validationsRules.heightMessage,
        });
      }

      let isValid = true;
      this.validations.forEach((item) => {
        if (!item.success) {
          isValid = false;
        }
      });

      const parsed: ValidationState = {
        fileId,
        isValid,
        entries: JSON.stringify(this.validations),
      };

      isValid
        ? this.successAnalysisIds = this.successAnalysisIds.concat(fileId)
        : this.errorAnalysisIds = this.errorAnalysisIds.concat(fileId);

      this.validationState = this.validationState.concat(parsed);
      this.store.dispatch(setValidationsState({ validations: this.validationState }));
      this.store.dispatch(setSuccessAnalysisIds({ successAnalysisIds: this.successAnalysisIds }));
      this.store.dispatch(setErrorAnalysisIds({ errorAnalysisIds: this.errorAnalysisIds }));
    }
  }
}
