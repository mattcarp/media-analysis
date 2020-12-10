import { forkJoin as observableForkJoin, from as observableFrom, Observable } from 'rxjs';
import { EventEmitter, Injectable } from '@angular/core';

import { HelperService } from './helper.service';

declare let $: any;

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  endpoint: string;
  originalExtension: string;
  signalAnalysis = [];
  detectStartedEmitter = new EventEmitter();
  resultsEmitter = new EventEmitter();
  FRAMES_PER_SECOND = 75;

  constructor(private helperService: HelperService) {
    this.endpoint = this.helperService.getEndpoint();
  }

  framesToTime(cdFrames: number): string {
    const totalSeconds = Math.floor(cdFrames / this.FRAMES_PER_SECOND);
    const frames = this.padField(cdFrames % this.FRAMES_PER_SECOND);
    const seconds = this.padField(totalSeconds % 60);
    const minutes = this.padField(Math.floor(totalSeconds / 60));

    return minutes + ':' + seconds + ':' + frames;
  }

  padField(field: number): string {
    return field.toString().length < 2 ? `0${field}` : `${field}`;
  }

  detectMono(mediaFile: File, bitrate?: number): void {
    const result = [];
    // this.results = [];
    // if bitrate is undefined, assume 25mbps
    const videoBitrate = bitrate || 25000000;
    // video bitrate is a bit smaller than overall bitrate
    // TODO adjust chunk size if file is very short
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    console.log(`%c Mono chunk size: ${MONO_CHUNK_SIZE}`, 'color: dodgerblue ');

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

    console.log(`%c In detect mono, the source file is this long: ${mediaFile.size}`, 'color: dodgerblue ');
    console.log(`%c And the front slice is this long: ${frontSlice.size}`, 'color: dodgerblue ');
    console.log(`%c Mono middle slice: \t starts at: ${midSliceStart}, \t ends at: ${midSliceEnd}`,
      'color: dodgerblue ',
    );
    console.log(`%c Which is based on the video bitrate of: ${videoBitrate}`, 'color: dodgerblue ');

    const observeFront = observableFrom(this.requestMono(frontSlice, 'front'));
    const observeMiddle = observableFrom(this.requestMono(midSlice, 'middle'));
    const observeEnd = observableFrom(this.requestMono(endSlice, 'end'));
    // let observeForkJoined = Observable.forkJoin(observeFront, observeMiddle, observeEnd);

    // let observeFront = Observable.fromPromise(this.requestAsync(frontSlice, 'front'));
    // let observeMiddle = Observable.fromPromise(this.requestAsync(midSlice, 'middle'));
    // let observeEnd = Observable.fromPromise(this.requestAsync(endSlice, 'end'));

    const observeJoined = observableForkJoin(observeFront, observeMiddle, observeEnd);

    observeJoined.subscribe((data) => {
      console.log(`%c Mono subscribe result:`, 'color: dodgerblue ');
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
        console.log(`%c Error on the mono detection ajax request for chunk: ${chunkPosition}`, 'color: red');
        console.log(`%c ${err}`, 'color: red');
      },
      success: (data) => {
        this.signalAnalysis.push(data);
        console.log(`%c RequestMono success function-data: ${data}`, 'color: green');
        console.log(`%c RequestMono: signal analysis length: ${this.signalAnalysis.length}`, 'color: green');
      },
    });
    // return Observable.fromPromise(promise);
  }
}
