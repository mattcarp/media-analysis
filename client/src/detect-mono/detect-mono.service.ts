import {EventEmitter, Injectable} from 'angular2/core';

declare var $: any;
declare var FileReader: any;


@Injectable()
export class DetectMonoService {
  // TODO use the endpoint service
  endpoint: string = "http://localhost:3000/";
  originalExtension: string;
  monoDetections: Object[] = [];

  detectStartedEmitter = new EventEmitter();
  resultsEmitter = new EventEmitter();
  results: Object[] = [];

  detectMono(mediaFile: File, bitrate?: number) {
    // if bitrate is undefined, assume 25mbps
    let videoBitrate = bitrate | 25000000;
    // video bitrate is a bit smaller than overall bitrate
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    console.log("mono chunk size", MONO_CHUNK_SIZE);

    const length = mediaFile.size;
    const frontSliceStart = Math.floor(length / 3);
    const frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
    const frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);
    // TODO calculate middle slice
    const midSliceStart = Math.floor(length /2) - (MONO_CHUNK_SIZE / 2);
    const midSliceEnd = midSliceStart + MONO_CHUNK_SIZE;
    const midSlice = mediaFile.slice(midSliceStart, midSliceEnd);

    const endSliceStart = frontSliceStart * 2;
    const endSliceEnd = endSliceStart + MONO_CHUNK_SIZE;
    const endSlice = mediaFile.slice(endSliceStart, endSliceEnd);



    console.log("in detect mono, my source file is this long:", mediaFile.size);
    console.log("and the front slice is this long:", frontSlice.size);
    // console.log("middle slice:", midSlice);
    console.log("which is based on the video bitrate of", videoBitrate);
    // TODO use rxjs observable
    this.detectStartedEmitter.emit(true);
    $.when(this.requestMono(frontSlice, "front"))
      .then((data, textStatus, jqXHR) => {
        console.log("first mono detect call is complete:")
        console.log(data);
        this.results.push(data);
        return this.results;

      })
      .then(this.requestMono(midSlice, "middle"))
      .then((data, textStatus, jqXHR) => {
        console.log("second (middle) mono detect call should be done:");
        console.log(data);
        this.results.push(data);
      })
      .then(this.requestMono(endSlice, "end"))
      .then((data, textStatus, jqXHR) => {
        console.log("final mono detect call should be done:");
        console.log(data);
        this.results.push(data);
      })
      .then((finalResults) => {
        console.log("final mono detect call should be done:");
        console.log(finalResults);
        this.resultsEmitter.emit(finalResults);
      });
  }

  requestMono(slice: Blob, chunkPosition: string) {
    let self = this;
    let promise =  $.ajax({
      type: "POST",
      url: this.endpoint + "mono",
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      // add any custom headers
      beforeSend: function(request) {
        request.setRequestHeader("xa-chunk-position",
          chunkPosition);
      },
      error: (err) => {
        console.log("error on the mono detection ajax request for chunk", chunkPosition);
        console.log(err);
      },
      success: (data) => {
        this.monoDetections.push(data);
        console.log("mono detection array:");
        console.dir(this.monoDetections);
      }
    });

    return promise;
    // return Observable.fromPromise(promise);
  }
}
