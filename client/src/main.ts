
///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {Component, Pipe, PipeTransform} from "angular2/core";
// import {Observable} from 'rxjs/Rx';
import {bootstrap} from "angular2/platform/browser";

import {DetectBlackComponent} from './detect-black/detect-black.component';
import {DetectBlackService} from './detect-black/detect-black.service';
import {HandleFilesComponent} from './handle-files/handle-files.component';
import {FileHandlerService} from "./handle-files/handle-files.service";
import {ExtractMetadataService} from "./extract-metadata/extract-metadata.service";

// initial slice for metadata analysis
const SLICE_SIZE = 150000;
// bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
const BLACK_CHUNK_SIZE = 10000000;
// minimum time, in seconds, for black at head and tail
const MIN_BLACK_TIME = 4;
// allow for jQuery - necessary for its ajax library
declare var $: any;
declare var FileReader: any;

@Component({
  selector: "analysis-app",
  templateUrl: "src/main.html",
  directives: [DetectBlackComponent, HandleFilesComponent],
  providers: [DetectBlackService, FileHandlerService, ExtractMetadataService]
})
export class AnalysisApp {
  endpoint: string;
  results: Object;
  format: Object[];
  formatTags: Object[];
  ffprobeErr: string;
  mediaFile: File;
  originalExtension: string;
  monoDetectStarted: boolean;
  monoDetectFront: Object;
  showFormat: boolean = false;
  monoDetections: Object[] = [];
  displayMonoDetails: boolean[] = [];
  fileHandlerService: any;

  streams: Object[][]; // an array of arrays of stream objects

  constructor(public detectBlackService: DetectBlackService,
    fileHandlerService: FileHandlerService) {
    // TODO call the endpoint service
    this.fileHandlerService = fileHandlerService;
    this.endpoint = this.setEndpoint();
  }

  // getMetadata(mediaFile: File) {
  //   let self = this;
  //   let mediafile = this.fileHandlerService.getMediaFile();
  //   let reader = new FileReader();
  //   // let blob = this.mediaFile.slice(0, SLICE_SIZE);
  //
  //   // if we use onloadend, we need to check the readyState.
  //   reader.onloadend = (evt) => {
  //     // if (evt.target.readyState == FileReader.DONE) { // DONE == 2
  //       // angular Http doesn't yet support raw binary POSTs
  //       // see line 62 at
  //       // https://github.com/angular/angular/blob/2.0.0-beta.1/modules/angular2/src/http/static_request.ts
  //       $.ajax({
  //         type: "POST",
  //         url: this.endpoint + "analysis",
  //         data: blob,
  //         // don't massage binary to JSON
  //         processData: false,
  //         // content type that we are sending
  //         contentType: 'application/octet-stream',
  //         // data type that we expect in return
  //         // dataType: "",
  //         error: function(err) {
  //           console.log("you have an error on the ajax request:");
  //           console.log(err);
  //         },
  //         success: data => {
  //           // error handling
  //           console.log("this is what i got from ffprobe metadata:");
  //           console.log(data);
  //           self.renderResult(data);
  //
  //           let analysisObj = JSON.parse(data.analysis);
  //           let videoBitrate = analysisObj.streams[0].bit_rate;
  //           let type = analysisObj.streams[0].codec_type;
  //
  //           if (type === "video") {
  //             this.processVideo(this.mediaFile, analysisObj);
  //           }
  //         }
  //       });
  //     // }
  //   };
  //
  //   // this.mediaFile = file;
  //   this.originalExtension = this.mediaFile.name.split(".").pop();
  //   console.log("original file extension:", this.originalExtension);
  //   let blob = mediaFile.slice(0, SLICE_SIZE);
  //   console.log("i believe i can fly");
  //   reader.readAsBinaryString(blob);
  // }

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
    $.when(this.requestMono(frontSlice, "front"))
      .then((data, textStatus, jqXHR) => {
        console.log("first mono detect call is complete:")
        console.log(data);
      })
      .then(this.requestMono(midSlice, "middle"))
      .then((data, textStatus, jqXHR) => {
        console.log("second (middle) mono detect call should be done:");
        console.log(data);
      })
      // .then(this.requestMono(endSlice, "end"))
      // .then((data, textStatus, jqXHR) => {
      //   console.log("final mono detect call should be done:");
      //   console.log(data);
      // });
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
    let mediaFile = this.fileHandlerService.getMediaFile();
    this.getMetadata(mediaFile);
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
