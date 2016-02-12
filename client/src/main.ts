
///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {Component, Pipe, PipeTransform} from "angular2/core";
// import {Observable} from 'rxjs/Rx';
import {bootstrap} from "angular2/platform/browser";
// import {NgIf} from 'angular2/common';

// import "rxjs/add/operator/map";
// import "rxjs/add/operator/retry";

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
  // directives: [NgIf]
})
export class AnalysisApp {
  endpoint: string;
  results: Object;
  format: Object[];
  formatTags: Object[];
  ffprobeErr: string;
  headBlackStarted: boolean;
  tailBlackStarted: boolean
  headBlackDetection: Object[];
  tailBlackDetection: Object[];
  headBlob: any;
  tailBlob: any;
  mediaFile: File;
  headBlackTryCount: number = 0;
  tailBlackTryCount: number = 0;
  // progress will be a float = MAX_TRIES / tryCount
  blackProgressHead: number;
  blackProgressTail: number;
  headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  originalExtension: string;
  monoDetectStarted: boolean;
  monoDetectFront: Object;
  showFormat: boolean = false;
  monoDetections: Object[] = [];

  streams: Object[][]; // an array of arrays of stream objects

  constructor() {
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
        console.log("this, from requestMono, for the chunk position", chunkPosition);
        console.log(this);
        this.monoDetections.push(data);
        console.dir(data.blackDetect);
      }
    });

    return promise;
    // return Observable.fromPromise(promise);
  }

  processVideo(mediaFile: File, bitrate: number) {
    // send fixed chunk, then request more bytes and concat if
    // blackDetect shows a black_start but no black_end

    // we detect tail black when head black is done, to avoid shared state issue
    this.headBlackStarted = true;
    this.recursiveBlackDetect(this.mediaFile, "head");

    this.tailBlackStarted = true;
    this.recursiveBlackDetect(this.mediaFile, "tail");

    this.monoDetectStarted = true;
    this.detectMono(this.mediaFile, bitrate);
  }

  changeListener($event): void {
    this.getMetadata($event.target);
  }

  // is called separately for "head" and "tail" (position string)
  recursiveBlackDetect(mediaFile: File, position: string,
    headFilename = this.headBlackFilename) {
    const MAX_TRIES = 20;
    // use a fixed size chunk as bitrates from ffmpeg are unreliable
    const BLACK_CHUNK_SIZE = 1000000;
    // minimum time, in seconds, for black at head and tail
    const MIN_BLACK_TIME = 3;
    let sliceStart;
    let sliceEnd;
    let tailSliceStart;
    let tailSliceEnd;
    // initial stop condition:
    if (position === "head" && this.headBlackTryCount >= MAX_TRIES) {
      console.log("max retries exceeded for black detection in file", position);
      // TODO add alert to DOM
      this.headBlackStarted = false;
      return;
    }
    if (position === "tail" && this.tailBlackTryCount >= MAX_TRIES) {
      console.log("max retries exceeded for black detection in file", position);
      // TODO add alert to DOM
      this.tailBlackStarted = false;
      return;
    }

    if (position === "head") {
      sliceStart = (BLACK_CHUNK_SIZE * this.headBlackTryCount) +
        this.headBlackTryCount;
        sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
        console.log("head try count:", this.headBlackTryCount,
          "slice start:", sliceStart, "slice end:", sliceEnd);
    }
    if (position === "tail") {
      tailSliceEnd = this.mediaFile.size -
       (BLACK_CHUNK_SIZE * this.tailBlackTryCount) - this.tailBlackTryCount;
      tailSliceStart = tailSliceEnd - BLACK_CHUNK_SIZE;
        // sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
        console.log("tail try count:", this.tailBlackTryCount,
          "tail slice start:", tailSliceStart, "tail slice end:", tailSliceEnd);
    }

    let sliceToUse;
    if (position === "head") {
      sliceToUse = mediaFile.slice(sliceStart, sliceEnd);
    }
    if (position === "tail") {
      sliceToUse = mediaFile.slice(tailSliceStart, tailSliceEnd);
    }


    if (position === "head") {
      this.blackProgressHead = this.headBlackTryCount / MAX_TRIES;
    }
    if (position === "tail") {
      this.blackProgressTail = this.tailBlackTryCount / MAX_TRIES;
    }

    let fileToUse;
    if (position === "head") {
      fileToUse = this.headBlackFilename + "." + this.originalExtension;
    }

    if (position === "tail") {
      fileToUse = this.tailBlackFilename + "." + this.originalExtension;
    }


    $.when(this.requestBlack(sliceToUse, position, fileToUse))
      .then((data, textStatus, jqXHR) => {

      if (data.blackDetect[0]) {
        let duration = parseFloat(data.blackDetect[0].duration);
        console.log("this is my black duration, returned from requestBlack:");
        console.log(duration);

        // stop condition
        if (duration >= MIN_BLACK_TIME) {
          console.log("the detected black duration of", duration,
            "is greater or equal to the min black time of", MIN_BLACK_TIME);
          console.log("so we can stop recursing");
          // TODO set tail dom values
          if (position === "head") {
            this.headBlackStarted = false;
            this.headBlackDetection = data.blackDetect;

          }
          if (position === "tail") {
            this.tailBlackStarted = false;
            this.tailBlackDetection = data.blackDetect;
          }
          return;
        }
      } else {
        console.log("no blackdetect object on the returned array");
      }

      // TODO any additional stop conditions?
      if (position === "head") {
        this.headBlackTryCount++;
      }
      if (position === "tail") {
        console.log("tailBlackTryCount:",
          this.tailBlackTryCount)
        this.tailBlackTryCount++;
      }

      // recurse
      this.recursiveBlackDetect(mediaFile, position);
    });
  }

  requestBlack(slice: any, position: string, filename: string) {
    return $.ajax({
      type: "POST",
      url: this.endpoint + "black",
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      beforeSend: function(request) {
        request.setRequestHeader("xa-file-to-concat",
          filename);
        request.setRequestHeader("xa-black-position",
          position);
      },
      error: (err) => {
        console.log("error on the black detection ajax request:");
        console.log(err);
      },
      success: (data) => {
        console.log("from requestBlack, for the", position);
        console.dir(data.blackDetect);
      }
    });
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
