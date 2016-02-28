import {EventEmitter, Injectable} from "angular2/core";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";


import {EndpointService} from "../handle-endpoints/endpoint.service";

declare var $: any;
declare var FileReader: any;


@Injectable()
export class DetectMonoService {
  endpoint: string;
  originalExtension: string;
  signalAnalysis: Object[] = [];

  detectStartedEmitter = new EventEmitter();
  resultsEmitter = new EventEmitter();


  constructor(endpointService: EndpointService) {
    this.endpoint = endpointService.getEndpoint();
  }

  detectMono(mediaFile: File, bitrate?: number) {
    let result: Object = {};
    // this.results = [];
    // if bitrate is undefined, assume 25mbps
    let videoBitrate = bitrate || 25000000;
    // video bitrate is a bit smaller than overall bitrate
    // TODO adjust chunk size if file is very short
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    console.log("mono chunk size", MONO_CHUNK_SIZE);

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


    console.log("in detect mono, the source file is this long:", mediaFile.size);
    console.log("and the front slice is this long:", frontSlice.size);
    console.log("mono middle slice starts at", midSliceStart);
    console.log("mono middle slice ends at", midSliceEnd);
    console.log("which is based on the video bitrate of", videoBitrate);

    // todo use observables wrapping the jquery ajax call
    let observeFront = Observable.fromPromise(this.requestMono(frontSlice, "front"));
    observeFront.subscribe(response => {
      result["front"] = response;
      console.log("here's my result object after adding from:", result);
      this.resultsEmitter.emit(result);
    });
    let observeMiddle = Observable.fromPromise(this.requestMono(midSlice, "middle"));
    observeMiddle.subscribe(response => {
      result["middle"] = response;
      console.log("here's my result object so after adding middle:", result);
      this.resultsEmitter.emit(result);
    });
    let observeEnd = Observable.fromPromise(this.requestMono(endSlice, "end"));
    observeEnd.subscribe(response => {
      result["end"] = response;
      console.log("here's my result object so after adding end:", result);
      // TODO we should execute serially to ensure that by the time we're at the end,
      // all other segments are done
      this.detectStartedEmitter.emit(false);
      this.resultsEmitter.emit(result);
    });
  }

  requestMono(slice: Blob, chunkPosition: string) {
    this.detectStartedEmitter.emit(true);
    // this.signalAnalysis = [];
    let promise =  $.ajax({
      type: "POST",
      url: this.endpoint + "mono",
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: "application/octet-stream",
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
        console.log("requestMono success function-data:", data);
        this.signalAnalysis.push(data);
        console.log("requestMono: signal analysis length:", this.signalAnalysis.length);
      }
    });

    return promise;
    // return Observable.fromPromise(promise);
  }
}
