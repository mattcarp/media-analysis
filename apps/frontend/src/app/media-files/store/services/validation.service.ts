import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { MediaFilesService } from './media-files.service';
import { MediaFilesState } from '../media-files.reducer';
import { ValidationState } from '../models';
import { setValidationsState } from '../media-files.actions';
import { validationRules } from './validation-rules.constants';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  videoValidations: any[] = [];
  audioValidations: any[] = [];
  videoRules = validationRules.videoStream;
  audioRules = validationRules.audioStream;
  validationState: ValidationState[] = [];
  successAnalysisIds: string[] = [];
  errorAnalysisIds: string[] = [];

  constructor(
    private mediaFileService: MediaFilesService,
    private store: Store<MediaFilesState>,
    private http: HttpClient,
    private helperService: HelperService,
  ) {}

  validate(fileId: string, data: { analysis; error }, err?): void {
    if (data.analysis) {
      const analysisObj = JSON.parse(data.analysis);
      const streams: any = analysisObj.streams;
      const format: any = analysisObj.format;
      let videoStream: any;
      let audioStream: any;

    if (streams && streams.length) {
      streams.forEach((stream) => {
        if (stream.codec_type === 'video') {
          videoStream = stream;
        }
        if (stream.codec_type === 'audio') {
          audioStream = stream;
        }
      });
    }

      console.log(
        `%c Hey what's the video stream in image?`,
        'color: orange',
      );
      console.log(videoStream);

      if (videoStream) {
        this.videoValidations.push({
          name: 'Codec',
          value: videoStream.codec_long_name,
          success: this.videoRules.codecs.indexOf(videoStream.codec_name) > -1,
          message: this.videoRules.codecsMessage,
        });

        this.videoValidations.push({
          name: 'Height',
          value: videoStream.height,
          success: videoStream.height === this.videoRules.height,
          message: this.videoRules.heightMessage,
        });

        this.videoValidations.push({
          name: 'Width',
          value: videoStream.width,
          success: videoStream.width === this.videoRules.width,
          message: this.videoRules.widthMessage,
        });

      const operands = videoStream.r_frame_rate.split('/');
      const framerate =
        Math.round((operands[0] / operands[1] + Number.EPSILON) * 1000) / 1000;
      console.log('valide-fomate: computed framerate:', framerate);
      this.videoValidations.push({
        name: 'Frame Rate',
        value: framerate,
        success: this.videoRules.frameRates.indexOf(framerate) > -1,
        message: this.videoRules.frameRatesMessage,
      });
    }

      if (audioStream) {
        this.audioValidations.push({
          name: 'Bit Depth',
          value: audioStream && audioStream.bits_per_sample,
          success: this.audioRules.bitDepths.indexOf(audioStream && audioStream.bits_per_sample) > -1,
          message: this.audioRules.bitDepthsMessage,
        });

        this.audioValidations.push({
          name: 'Sample Rate',
          value: audioStream && audioStream.sample_rate,
          success: audioStream && audioStream.sample_rate === this.audioRules.sampleRate,
          message: this.audioRules.sampleRateMessage,
        });

        this.audioValidations.push({
          name: 'Channel Layout',
          value: audioStream && audioStream.channel_layout,
          success: audioStream && audioStream.channel_layout === this.audioRules.channelLayout,
          message: this.audioRules.channelLayoutMessage,
        });

        this.audioValidations.push({
          name: 'Channel Count',
          value: audioStream && audioStream.channels,
          success: audioStream && audioStream.channels === this.audioRules.channels,
          message: this.audioRules.channelsMessage,
        });

        this.audioValidations.push({
          name: 'Codec',
          value: audioStream && audioStream.codec_long_name,
          success: this.audioRules.codecs.indexOf(audioStream && audioStream.codec_name) > -1,
          message: this.audioRules.codecsMessage,
        });
      }

      let isValid = true;
      this.videoValidations.forEach((item) => {
        if (!item.success) {
          isValid = false;
        }
      });
      this.audioValidations.forEach((item) => {
        if (!item.success) {
          isValid = false;
        }
      });
      const validations = this.videoValidations.concat(this.audioValidations);

      if (err) {
        isValid = false;
      }

      const parsed: ValidationState = {
        fileId,
        isValid,
        entries: JSON.stringify(validations),
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

  getAnalysis(body: Blob): Observable<any> {
    const url = `${this.helperService.getEndpoint()}analysis`;
    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type':  'application/octet-stream',
    });
    return this.http.post(url, body, { headers });
  }
}
