import { Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExtractMetadataService } from '../extract-metadata/extract-metadata.service';
import { LoggerService } from '../services/logger.service';
import { VideoRulesConstants } from './video-rules.constants';

@Component({
  selector: 'app-analyze-video',
  templateUrl: './analyze-video.component.html',
})
export class AnalyzeVideoComponent {
  @Output() validateResult?: EventEmitter<string> = new EventEmitter();
  metadataStarted: boolean;
  metadataResult: any;
  showResults: boolean;
  audioValidations: any[] = [];
  videoValidations: any[] = [];
  isProRes = false;
  videoFormat: string;
  proResMsg: string;
  videoRules = VideoRulesConstants.videoStream[0];
  audioRules = VideoRulesConstants.audioStream[0];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private extractMetadataService: ExtractMetadataService,
    private loggerService: LoggerService,
  ) {
    this.extractMetadataService.metadataStarted.subscribe((value) => {
      this.metadataStarted = value;
    });

    this.extractMetadataService.metadataResult
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.metadataStarted = false;
        this.validate(value);
      });
  }

  validate(metadata: any): void {
    // clear state - TODO use redux pattern
    this.audioValidations = [];
    this.videoValidations = [];

    const analysisObj = JSON.parse(metadata.analysis);

    // build audio validations array
    const streams: any = analysisObj.streams;
    // TODO use the functional equivalent of this for loop
    let audioStream: any;
    if (streams && streams.length) {
      for (let i = 0; i < streams.length; i += 1) {
        if (streams[i].codec_type === 'audio') {
          audioStream = streams[i];
        }
      }
    }
    this.loggerService.info(`Hey what's the audio stream?`, 'color: orange');
    console.log(audioStream);

    if (audioStream) {
      this.audioValidations.push({
        name: 'Bit Depth',
        value: audioStream && audioStream.bits_per_sample,
        pass: this.audioRules.bitDepths.indexOf(audioStream && audioStream.bits_per_sample) > -1,
        message: this.audioRules.bitDepthsMessage,
      });

      this.audioValidations.push({
        name: 'Sample Rate',
        value: audioStream && audioStream.sample_rate,
        pass: audioStream && audioStream.sample_rate === this.audioRules.sampleRate,
        message: this.audioRules.sampleRateMessage,
      });

      this.audioValidations.push({
        name: 'Channel Layout',
        value: audioStream && audioStream.channel_layout,
        pass: audioStream && audioStream.channel_layout === this.audioRules.channelLayout,
        message: this.audioRules.channelLayoutMessage,
      });

      this.audioValidations.push({
        name: 'Channel Count',
        value: audioStream && audioStream.channels,
        pass: audioStream && audioStream.channels === this.audioRules.channels,
        message: this.audioRules.channelsMessage,
      });

      this.audioValidations.push({
        name: 'Codec',
        value: audioStream && audioStream.codec_long_name,
        pass: this.audioRules.codecs.indexOf(audioStream && audioStream.codec_name) > -1,
        message: this.audioRules.codecsMessage,
      });
    }

    // TODO get index of first stream with codec_type === "video",
    // rather than hard-coding this as index 0
    // const videoStream = analysisObj.streams[0];
    let videoStream: any;

    if (streams && streams.length) {
      for (let i = 0; i < streams.length; i += 1) {
        if (streams[i].codec_type === 'video') {
          videoStream = streams[i];
        }
      }
    }

    this.loggerService.info(`Hey what's the video stream?`, 'color: orange');
    console.log(videoStream);

    this.isProRes = videoStream && videoStream.codec_long_name === 'ProRes';
    this.videoFormat = videoStream && videoStream.codec_name;

    if (videoStream) {
      this.videoValidations.push({
        name: 'Codec',
        value: videoStream.codec_long_name.substring(0, 20),
        // TODO ProRess and mpeg2 are a pass, but h.264 and Avid DNX HD
        // are allowed, with a warning message
        pass: this.videoRules.codecs.indexOf(videoStream.codec_name) > -1,
        message: this.videoRules.codecsMessage,
      });

      this.videoValidations.push({
        name: 'Height',
        value: videoStream.height,
        pass: videoStream.height === this.videoRules.height,
        message: this.videoRules.heightMessage,
      });

      this.videoValidations.push({
        name: 'Width',
        value: videoStream.width,
        pass: videoStream.width === this.videoRules.width,
        message: this.videoRules.widthMessage,
      });

      if (this.isProRes) {
        this.videoValidations.push({
          name: 'Encoder',
          value: videoStream.tags.encoder,
          pass: videoStream.tags.encoder === this.videoRules.tagsEncoder,
          message: this.videoRules.tagsEncoderMessage,
        });
      }

      const operands = videoStream.r_frame_rate.split('/');
      const framerate = Math.round((operands[0] / operands[1] + Number.EPSILON) * 1000) / 1000;
      console.log('valide-fomate: computed framerate:', framerate);
      this.videoValidations.push({
        name: 'Frame Rate',
        value: framerate,
        pass: this.videoRules.frameRates.indexOf(framerate) > -1,
        message: this.videoRules.frameRatesMessage,
      });
    }

    let result = 'pass';
    this.videoValidations.forEach((item) => {
      if (!item.pass) {
        result = 'error';
      }
    });

    this.validateResult.emit(result);
    this.showResults = true;
    this.destroy$.next();
    this.destroy$.unsubscribe();
  }
}
