import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { validationsRules } from './validations-rules.constants';
import { ValidationState } from '../models';
import { MediaFilesState } from '../reducers/media-files.reducer';
import { MediaFilesService } from './media-files.service';
import {
  setErrorAnalysisIds,
  setSuccessAnalysisIds,
  setValidationsState,
} from '../actions/media-files.actions';

@Injectable({
  providedIn: 'root',
})
export class ValidationsAudioService {
  validations: any[] = [];
  validationsRules = validationsRules.audioStream[0];
  validationState: ValidationState[] = [];
  successAnalysisIds: string[] = [];
  errorAnalysisIds: string[] = [];

  constructor(
    private mediaFileService: MediaFilesService,
    private store: Store<MediaFilesState>,
    private logger: NGXLogger,
  ) {}

  validate(fileId: string, data: {analysis; error}): void {
    const analysisObj = JSON.parse(data.analysis);
    const streams: any = analysisObj.streams;
    const format: any = analysisObj.format;
    let audioStream: any;

    this.validations = [];

    if (streams && streams.length) {
      streams.forEach((stream) => {
        if (stream.codec_type === 'audio') {
          audioStream = stream;
        }
      });
    }

    console.log(
      `%c Hey what's the video stream in image?`,
      'color: orange',
    );
    console.log(audioStream);

    if (audioStream) {
      this.validations.push({
        name: 'Bit Depth',
        value: audioStream && audioStream.bits_per_sample,
        success: this.validationsRules.bitDepths
          .indexOf(audioStream && audioStream.bits_per_sample) > -1,
        message: this.validationsRules.bitDepthsMessage,
      });

      this.validations.push({
        name: 'Sample Rate',
        value: audioStream && audioStream.sample_rate,
        success: audioStream && audioStream.sample_rate === this.validationsRules.sampleRate,
        message: this.validationsRules.sampleRateMessage,
      });

      this.validations.push({
        name: 'Channel Layout',
        value: audioStream && audioStream.channel_layout,
        success: audioStream && audioStream.channel_layout === this.validationsRules.channelLayout,
        message: this.validationsRules.channelLayoutMessage,
      });

      this.validations.push({
        name: 'Channel Count',
        value: audioStream && audioStream.channels,
        success: audioStream && audioStream.channels === this.validationsRules.channels,
        message: this.validationsRules.channelsMessage,
      });

      this.validations.push({
        name: 'Codec',
        value: audioStream && audioStream.codec_long_name,
        success: this.validationsRules.codecs.indexOf(audioStream && audioStream.codec_name) > -1,
        message: this.validationsRules.codecsMessage,
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
