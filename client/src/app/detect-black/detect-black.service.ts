import { EventEmitter, Injectable } from '@angular/core';

import { EndpointService } from '../services/endpoint.service';
import { LoggerService } from '../services/logger.service';

declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class DetectBlackService {
  headBlackStarted = new EventEmitter();
  tailBlackStarted = new EventEmitter();
  headProgress = new EventEmitter();
  tailProgress = new EventEmitter();
  headBlackResult = new EventEmitter();
  tailBlackResult = new EventEmitter();
  headBlob: any;
  tailBlob: any;
  headBlackTryCount = 0;
  tailBlackTryCount = 0;
  blackProgressHead: number;
  blackProgressTail: number;
  // the duration of the previous iteration, to see if there was an increase
  headBlackPrevDuration: number;
  tailBlackPrevDuration: number;
  headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  originalExtension: string;

  currentHeadData: any;
  currentTailData: any;

  endpoint: string;
  MAX_TRIES = 10;
  // use a fixed size chunk as bitrates from ffmpeg are unreliable
  BLACK_CHUNK_SIZE = 1000000;
  // minimum time, in seconds, for black at head and tail
  MIN_BLACK_TIME = 3;

  constructor(endpointService: EndpointService, private loggerService: LoggerService) {
    this.endpoint = endpointService.getEndpoint();
  }

  // is called separately for 'head' and 'tail' (position string)
  recursiveBlackDetect(mediaFile: File, position: string) {
    let sliceStart: number;
    let sliceEnd: number;
    let tailSliceStart: number;
    let tailSliceEnd: number;

    this.originalExtension = mediaFile.name.split('.').pop();

    // initial stop condition:
    if (position === 'head' && this.headBlackTryCount >= this.MAX_TRIES) {
      this.loggerService.info(`Max retries exceeded for head black detection in file: ${position}`, 'color: orange');
      // TODO add alert to DOM
      this.headBlackResult.emit(this.currentHeadData);
      this.headBlackStarted.emit(false);
      this.headBlackResult.emit(this.currentHeadData);
      return;
    }
    if (position === 'tail' && this.tailBlackTryCount >= this.MAX_TRIES) {
      this.loggerService.info(`Max retries exceeded for tail black detection in file: ${position}`, 'color: orange');
      // TODO add alert to DOM
      this.headBlackResult.emit(this.currentTailData);
      this.tailBlackStarted.emit(false);
      return;
    }

    if (position === 'head') {
      this.headBlackStarted.emit(true);
      sliceStart = this.BLACK_CHUNK_SIZE * this.headBlackTryCount + this.headBlackTryCount;
      sliceEnd = sliceStart + this.BLACK_CHUNK_SIZE;
      this.loggerService.debug(
        `Head try count: ${this.headBlackTryCount}, \t slice start: ${sliceStart}, \t slice end: ${sliceEnd}`,
        'color: grey',
      );
    }
    if (position === 'tail') {
      this.tailBlackStarted.emit(true);
      tailSliceEnd = mediaFile.size - this.BLACK_CHUNK_SIZE * this.tailBlackTryCount - this.tailBlackTryCount;
      tailSliceStart = tailSliceEnd - this.BLACK_CHUNK_SIZE;
      // sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
      this.loggerService.info(
        `Tail try count: ${this.tailBlackTryCount}, \t tail slice start: ${tailSliceStart}, \t tail slice end: ${tailSliceEnd}`,
        'color: grey',
      );
    }

    let fileToUse;
    let sliceToUse;
    if (position === 'head') {
      sliceToUse = mediaFile.slice(sliceStart, sliceEnd);
      this.loggerService.debug(
        `Slice for head black detect:\t type: ${sliceToUse.type}, \t size: ${sliceToUse.size}`,
        'color: grey',
      );
      this.blackProgressHead = this.headBlackTryCount / this.MAX_TRIES;
      this.headProgress.emit(this.blackProgressHead);
      fileToUse = this.headBlackFilename + '.' + this.originalExtension;
    }
    if (position === 'tail') {
      sliceToUse = mediaFile.slice(tailSliceStart, tailSliceEnd);
      // this.loggerService.debug(`Tail try counter: ${this.tailBlackTryCount}`, 'color: grey');
      this.blackProgressTail = this.tailBlackTryCount / this.MAX_TRIES;
      this.tailProgress.emit(this.blackProgressTail);
      fileToUse = this.tailBlackFilename + '.' + this.originalExtension;
    }

    $.when(this.requestBlack(sliceToUse, position, fileToUse)).then((data) => {
      if (data.blackDetect[0]) {
        const duration = parseFloat(data.blackDetect[0].duration);

        this.loggerService.info(`This is my black duration, returned from requestBlack:: ${duration}`, 'color: grey');

        if (position === 'head') {
          this.currentHeadData = data;
          if (this.headBlackPrevDuration && this.headBlackPrevDuration <= duration) {
            // duration is not increasing, might as well stop
            this.loggerService.info(`Black detection: duration isn't getting longer. TODO - stop here`, 'color: lime');
          }
        }
        if (position === 'tail') {
          this.currentTailData = data;
        }

        // stop condition
        if (duration >= this.MIN_BLACK_TIME) {
          this.loggerService.info(
            `The detected black duration of: ${duration} is greater or equal to the min black time of: ${this.MIN_BLACK_TIME}`,
            'color: grey',
          );

          this.loggerService.info(`So we can stop recursing.`, 'color: darkgrey');
          // TODO set tail dom values
          if (position === 'head') {
            this.headBlackStarted.emit(false);
            this.headBlackResult.emit(data.blackDetect);
          }
          if (position === 'tail') {
            this.tailBlackStarted.emit(false);
            this.tailBlackResult.emit(data.blackDetect);
          }
          return;
        }
      } else {
        this.loggerService.info(`No blackdetect object on the returned array`, 'color: grey');
      }

      // TODO additonal stop condition: if duration doesn't increment
      if (position === 'head') {
        this.headBlackTryCount += 1;
      }
      if (position === 'tail') {
        this.loggerService.info(`TailBlackTryCount: ${this.tailBlackTryCount}`, 'color: grey');
        this.tailBlackTryCount += 1;
      }

      // recurse
      this.recursiveBlackDetect(mediaFile, position);
    });
  } // recursiveBlackDetect

  requestBlack(slice: any, position: string, filename: string): any {
    return $.ajax({
      type: 'POST',
      url: this.endpoint + 'black',
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      beforeSend: function (request) {
        request.setRequestHeader('xa-file-to-concat', filename);
        request.setRequestHeader('xa-black-position', position);
      },
      error: (err) => {
        this.loggerService.info(`Error on the black detection ajax request:`, 'color: red');
        console.log(err);
      },
      success: (data) => {
        this.loggerService.info(`From requestBlack, for the: ${position}`, 'color: green');
        console.dir(data.blackDetect);
      },
    });
  }
}
