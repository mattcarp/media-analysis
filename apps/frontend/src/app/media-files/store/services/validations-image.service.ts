import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { validationsRules } from './validations-rules.constants';
import { ValidationState } from '../models';
import { MediaFilesState } from '../reducers/media-files.reducer';
import { MediaFilesService } from './media-files.service';
import { setValidationsState } from '../actions/media-files.actions';

@Injectable({
  providedIn: 'root',
})
export class ValidationsImageService {
  validations: any[] = [];
  validationsRules = validationsRules.imageStream[0];
  validationState: ValidationState[] = [];

  constructor(
    private mediaFileService: MediaFilesService,
    private store: Store<MediaFilesState>,
    private logger: NGXLogger,
  ) {}

  validate(fileId: string, data: {analysis; error}): void {
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

    this.validationState = this.validationState.concat(parsed);
    this.store.dispatch(setValidationsState({ validations: this.validationState }));
  }
}
