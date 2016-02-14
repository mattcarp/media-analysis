
///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {Component, Pipe, PipeTransform} from "angular2/core";
// import {Observable} from 'rxjs/Rx';
import {bootstrap} from "angular2/platform/browser";

import {DetectBlackComponent} from './detect-black/detect-black.component';
import {DetectBlackService} from './detect-black/detect-black.service';

// initial slice for metadata analysis
const SLICE_SIZE = 150000;
// bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
// TODO send a smaller chunk then send more if we dont have a black_end
const BLACK_CHUNK_SIZE = 10000000;
// minimum time, in seconds, for black at head and tail
const MIN_BLACK_TIME = 4;
// allow for jQuery - necessary for its ajax library
declare var $: any;
declare var FileReader: any;


@Component({
  selector: "analysis-app",
  templateUrl: "src/main.html",
  directives: [DetectBlackComponent],
  providers: [DetectBlackService]
})
export class AnalysisApp {
  endpoint: string;
  results: Object;
  format: Object[];
  formatTags: Object[];
  ffprobeErr: string;
  // headBlackStarted: boolean;
  // tailBlackStarted: boolean;
  // headBlackDetection: Object[];
  // tailBlackDetection: Object[];
  // headBlob: any;
  // tailBlob: any;
  mediaFile: File;
  // headBlackTryCount: number = 0;
  // tailBlackTryCount: number = 0;
  // progress will be a float = MAX_TRIES / tryCount
  // blackProgressHead: number;
  // blackProgressTail: number;
  // headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  // tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  originalExtension: string;
  monoDetectStarted: boolean;
  monoDetectFront: Object;
  showFormat: boolean = false;
  monoDetections: Object[] = [];
  displayMonoDetails: boolean[] = [];

  streams: Object[][]; // an array of arrays of stream objects

  constructor(public detectBlackService: DetectBlackService) {
    this.endpoint = this.setEndpoint();
  }

  getMetadata(target: any) {
    let self = this;
    let files = target.files;
    let file = files[0];
    let reader = new FileReader();

    // if we use onloadend, we need to check the readyState.
    reader.onloadend = (evt) => {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        // angular Http doesn't yet support raw binary POSTs
        // see line 62 at
        // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
        $.ajax({
          type: "POST",
          url: this.endpoint + "analysis",
          data: blob,
          // don't massage binary to JSON
          processData: false,
          // content type that we are sending
          contentType: 'application/octet-stream',
          // data type that we expect in return
          // dataType: "",
          error: function(err) {
            console.log("you have an error on the ajax request:");
            console.log(err);
          },
          success: data => {
            // error handling
            console.log("this is what i got from ffprobe metadata:");
            console.log(data);
            self.renderResult(data);

            let analysisObj = JSON.parse(data.analysis);
            let videoBitrate = analysisObj.streams[0].bit_rate;
            let type = analysisObj.streams[0].codec_type;

            if (type === "video") {
              this.processVideo(this.mediaFile, analysisObj);
            }
          }
        });
      }
    };

    this.mediaFile = file;
    this.originalExtension = this.mediaFile.name.split(".").pop();
    console.log("original file extension:", this.originalExtension);
    let blob = this.mediaFile.slice(0, SLICE_SIZE);
    reader.readAsBinaryString(blob);
  }

  detectMono(mediaFile: File, bitrate: number) {
    // if bitrate is undefined, assume 25mbps
    let videoBitrate = bitrate | 25000000;
    // video bitrate is a bit smaller than overall bitrate
    const MONO_CHUNK_SIZE = Math.floor((videoBitrate * 1.1) / 8);
    console.log("mono chunk size", MONO_CHUNK_SIZE);


    const length = mediaFile.size;
    const frontSliceStart = Math.floor(length / 3);
    const frontSliceEnd = frontSliceStart + MONO_CHUNK_SIZE;
    const frontSlice = mediaFile.slice(frontSliceStart, frontSliceEnd);
    // TODO calculate middle and end slices
    const endSliceStart = frontSliceStart * 2;
    // const endSlice = mediaFile.slice(endSliceStart, endSliceEnd);
    console.log("in detect mono, my source file is this long:", mediaFile.size);
    console.log("and the front slice is this long:", frontSlice.size);
    // console.log("middle slice:", midSlice);
    console.log("which is based on the video bitrate of", videoBitrate);
    // TODO use rxjs observable
    $.when(this.requestMono(frontSlice, "front"))
      .then((data, textStatus, jqXHR) => {

        console.log("first mono detect call is complete:")
        console.log(data);
        // this.detectMonoStarted = false;
        // self.monoDetections.push("bing");
        // console.log("my detections array", self.monoDetections);
        // self.monoDetectFront = data;
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

  processVideo(mediaFile: File, bitrate: number) {
    // send fixed chunk, then request more bytes and concat if
    // blackDetect shows a black_start but no black_end

    // this.headBlackStarted = true;
    this.detectBlackService.recursiveBlackDetect(mediaFile, "head");

    // this.tailBlackStarted = true;
    this.detectBlackService.recursiveBlackDetect(mediaFile, "tail");

    this.monoDetectStarted = true;
    this.detectMono(this.mediaFile, bitrate);
  }

  changeListener($event): void {
    this.getMetadata($event.target);
  }

  renderResult(data) {
    if (data.error) {
      this.ffprobeErr = data.error;
    }
    console.log("these are my top-level keys");
    console.log(Object.keys(data));
    let analysisObj = JSON.parse(data.analysis);
    console.log("analysis object, and number of keys:");
    console.log(analysisObj);
    console.log(Object.keys(analysisObj).length);
    if (analysisObj && Object.keys(analysisObj).length !== 0) {
      let formatObj = analysisObj.format;
      // zone.run(() => { this.showFormat = true});
      this.showFormat = true;
      this.format = this.processObject(formatObj);
      console.log("format object, from which we can filter extraneous keys:")
      console.log(this.format);

      if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
        this.formatTags = this.processObject(formatObj.tags);
      }
    }

    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
      let collectedStreams = [];
      let inputStreams = analysisObj.streams;
      inputStreams.forEach(currentStream => {
        console.log("i am a stream");
        collectedStreams.push(this.processObject(currentStream));
      });

      this.streams = collectedStreams;
    }

  }

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }

  setEndpoint() {
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000/";
    } else {
      return "http://52.0.119.124:3000/";
    }
  }

  // takes an object, removes any keys with array values, and returns
  // an array of objects: {key: value}
  // this is handy for ffprobe's format and tags objects
  processObject(formatObj): Object[] {
    let keysArr: string[] = Object.keys(formatObj);
    return keysArr
      // TODO filter if value for key is object or array, rather than not 'tags'
      .filter(formatKey => formatKey !== "tags")
      .map(formatKey => {
      let item: any = {};
      item.key = formatKey;
      item.value = formatObj[formatKey];
      return item;
    })
  }

  logError(err) {
    console.log("There was an error: ");
    console.log(err);
  }
}

bootstrap(AnalysisApp);
