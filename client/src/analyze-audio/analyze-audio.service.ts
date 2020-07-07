
import {forkJoin as observableForkJoin, from as observableFrom, Observable} from 'rxjs';
import {EventEmitter, Injectable} from 'angular2/core';




import {EndpointService} from '../handle-endpoints/endpoint.service';

declare var $: any;
declare var FileReader: any;


@Injectable()
export class AnalyzeAudioService {
  endpoint: string;
  originalExtension: string;
  signalAnalysis: Object[] = [];

  detectStartedEmitter = new EventEmitter();
  resultsEmitter = new EventEmitter();


  constructor(endpointService: EndpointService) {
    this.endpoint = endpointService.getEndpoint();
  }

  detectMono(mediaFile: File, bitrate?: number) {
    let result: Object[] = [];
    // this.results = [];
    // if bitrate is undefined, assume 25mbps
    let videoBitrate = bitrate || 25000000;
    // video bitrate is a bit smaller than overall bitrate
    // TODO adjust chunk size if file is very short
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    console.log('mono chunk size', MONO_CHUNK_SIZE);

    const length = mediaFile.size;
    const frontSliceStart = Math.floor(length / 3);
    const frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
    const frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);

    const midSliceStart = Math.floor(length / 2) - (MONO_CHUNK_SIZE / 2);
    const midSliceEnd = midSliceStart + MONO_CHUNK_SIZE;
    const midSlice = mediaFile.slice(midSliceStart, midSliceEnd);

    const endSliceStart = frontSliceStart * 2;
    const endSliceEnd = endSliceStart + MONO_CHUNK_SIZE;
    const endSlice = mediaFile.slice(endSliceStart, endSliceEnd);


    console.log('in detect mono, the source file is this long:', mediaFile.size);
    console.log('and the front slice is this long:', frontSlice.size);
    console.log('mono middle slice starts at', midSliceStart);
    console.log('mono middle slice ends at', midSliceEnd);
    console.log('which is based on the video bitrate of', videoBitrate);

    let observeFront = observableFrom(this.requestMono(frontSlice, 'front'));
    let observeMiddle = observableFrom(this.requestMono(midSlice, 'middle'));
    let observeEnd = observableFrom(this.requestMono(endSlice, 'end'));
    // let observeForkJoined = Observable.forkJoin(observeFront, observeMiddle, observeEnd);

    // let observeFront = Observable.fromPromise(this.requestAsync(frontSlice, 'front'));
    // let observeMiddle = Observable.fromPromise(this.requestAsync(midSlice, 'middle'));
    // let observeEnd = Observable.fromPromise(this.requestAsync(endSlice, 'end'));

    let observeJoined = observableForkJoin(observeFront, observeMiddle, observeEnd);

    observeJoined.subscribe(data => {
      console.log('mono subscribe result:');
      console.log(data); // => [frontOb, middleObj, endObj]
      this.resultsEmitter.emit(data);
    });

    observeFront.subscribe(response => {
      result[0] = response;
    });

    observeMiddle.subscribe(response => {
      result[1] = response;
    });

    observeEnd.subscribe(response => {
      result[2] = response;
      // TODO we should execute serially to ensure that by the time we're at the end,
      // all other segments are done -- is this now done via forkJoin?
      this.detectStartedEmitter.emit(false);
      // this.resultsEmitter.emit(result);
    });
  }

  requestMono(slice: Blob, chunkPosition: string) {
    this.detectStartedEmitter.emit(true);
    // this.signalAnalysis = [];
    let promise =  $.ajax({
      type: 'POST',
      url: this.endpoint + 'mono',
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      // add any custom headers
      beforeSend: function(request) {
        request.setRequestHeader('xa-chunk-position',
          chunkPosition);
      },
      error: (err) => {
        console.log('error on the mono detection ajax request for chunk', chunkPosition);
        console.log(err);
      },
      success: (data) => {
        console.log('requestMono success function-data:', data);
        this.signalAnalysis.push(data);
        console.log('requestMono: signal analysis length:', this.signalAnalysis.length);
      }
    });

    return promise;
    // return Observable.fromPromise(promise);
  }
}
