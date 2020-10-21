import { forkJoin as observableForkJoin, from as observableFrom, Observable } from 'rxjs';
import { EventEmitter, Injectable } from '@angular/core';

import { EndpointService } from '../services/endpoint.service';
import { LoggerService } from '../services/logger.service';

declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class AnalyzeAudioService {
  endpoint: string;
  originalExtension: string;
  signalAnalysis = [];

  detectStartedEmitter = new EventEmitter();
  resultsEmitter = new EventEmitter();

  constructor(endpointService: EndpointService, private loggerService: LoggerService) {
    this.endpoint = endpointService.getEndpoint();
  }

  detectMono(mediaFile: File, bitrate?: number): void {
    const result = [];
    // this.results = [];
    // if bitrate is undefined, assume 25mbps
    const videoBitrate = bitrate || 25000000;
    // video bitrate is a bit smaller than overall bitrate
    // TODO adjust chunk size if file is very short
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    this.loggerService.info(`Mono chunk size: ${MONO_CHUNK_SIZE}`, 'color: dodgerblue ');

    const length = mediaFile.size;
    const frontSliceStart = Math.floor(length / 3);
    const frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
    const frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);

    const midSliceStart = Math.floor(length / 2) - MONO_CHUNK_SIZE / 2;
    const midSliceEnd = midSliceStart + MONO_CHUNK_SIZE;
    const midSlice = mediaFile.slice(midSliceStart, midSliceEnd);

    const endSliceStart = frontSliceStart * 2;
    const endSliceEnd = endSliceStart + MONO_CHUNK_SIZE;
    const endSlice = mediaFile.slice(endSliceStart, endSliceEnd);

    this.loggerService.info(`In detect mono, the source file is this long: ${mediaFile.size}`, 'color: dodgerblue ');
    this.loggerService.info(`And the front slice is this long: ${frontSlice.size}`, 'color: dodgerblue ');
    this.loggerService.info(
      `Mono middle slice: \t starts at: ${midSliceStart}, \t ends at: ${midSliceEnd}`,
      'color: dodgerblue ',
    );
    this.loggerService.info(`Which is based on the video bitrate of: ${videoBitrate}`, 'color: dodgerblue ');

    const observeFront = observableFrom(this.requestMono(frontSlice, 'front'));
    const observeMiddle = observableFrom(this.requestMono(midSlice, 'middle'));
    const observeEnd = observableFrom(this.requestMono(endSlice, 'end'));
    // let observeForkJoined = Observable.forkJoin(observeFront, observeMiddle, observeEnd);

    // let observeFront = Observable.fromPromise(this.requestAsync(frontSlice, 'front'));
    // let observeMiddle = Observable.fromPromise(this.requestAsync(midSlice, 'middle'));
    // let observeEnd = Observable.fromPromise(this.requestAsync(endSlice, 'end'));

    const observeJoined = observableForkJoin(observeFront, observeMiddle, observeEnd);

    observeJoined.subscribe((data) => {
      this.loggerService.info(`Mono subscribe result:`, 'color: dodgerblue ');
      console.log(data); // => [frontOb, middleObj, endObj]
      this.resultsEmitter.emit(data);
    });

    observeFront.subscribe((response) => {
      result[0] = response;
    });

    observeMiddle.subscribe((response) => {
      result[1] = response;
    });

    observeEnd.subscribe((response) => {
      result[2] = response;
      // TODO we should execute serially to ensure that by the time we're at the end,
      // all other segments are done -- is this now done via forkJoin?
      this.detectStartedEmitter.emit(false);
      // this.resultsEmitter.emit(result);
    });
  }

  requestMono(slice: Blob, chunkPosition: string): Observable<any> {
    this.detectStartedEmitter.emit(true);
    // this.signalAnalysis = [];
    return $.ajax({
      type: 'POST',
      url: this.endpoint + 'mono',
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      // add any custom headers
      beforeSend: (request) => {
        request.setRequestHeader('xa-chunk-position', chunkPosition);
      },
      error: (err) => {
        this.loggerService.info(`Error on the mono detection ajax request for chunk: ${chunkPosition}`, 'color: red');
        this.loggerService.info(`${err}`, 'color: red');
      },
      success: (data) => {
        this.signalAnalysis.push(data);
        this.loggerService.info(`RequestMono success function-data: ${data}`, 'color: green');
        this.loggerService.info(`RequestMono: signal analysis length: ${this.signalAnalysis.length}`, 'color: green');
      },
    });
    // return Observable.fromPromise(promise);
  }
}
