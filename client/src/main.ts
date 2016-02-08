import {Component, Pipe, PipeTransform} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";

import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";

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
  templateUrl: "src/main.html"
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
  blackTryCount: number = 0;
  // progress will be a float = MAX_TRIES / tryCount
  blackProgressHead: number;
  blackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);

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
            console.log("you have an error on the ajax requst:");
            console.log(err);
          },
          success: data => {
            // error handling
            console.log("this is what i got from ffprobe metadata:");
            console.log(data);
            self.renderResult(data);

            let analyisObj = JSON.parse(data.analysis);
            let bitrate = analyisObj.format.bit_rate;


            // TODO -bitrates in metatadata are unreliable -
            // send fixed chunk, then request more bytes and concat if
            // blackDetect shows a black_start but no black_end
            self.headBlackStarted = true;
            self.recursiveBlackDetect(this.mediaFile, "head");
            // TODO tail black detect

            // self.headBlob = self.mediaFile.slice(0, BLACK_CHUNK_SIZE);
            // self.detectHeadBlack(self.headBlob, "head");

            self.detectMono();
          }
        });
      }
    };

    this.mediaFile = file;
    let blob = this.mediaFile.slice(0, SLICE_SIZE);
    reader.readAsBinaryString(blob);
  }

  changeListener($event): void {
    this.getMetadata($event.target);
  }

  // is called separately for "head" and "tail" (position string)
  recursiveBlackDetect(mediaFile: File, position: string, filename = this.blackFilename) {
    const MAX_TRIES = 10;
    // initial stop condition:
    if (this.blackTryCount >= MAX_TRIES) {
      console.log("max retries exceeded for black detection in file", position);
      // TODO add alert to DOM
      this.headBlackStarted = false;
      return;
    }

    // use a fixed size chunk as bitrates from ffmpeg are unreliable
    const BLACK_CHUNK_SIZE = 10000000;
    // minimum time, in seconds, for black at head and tail
    const MIN_BLACK_TIME = 4;
    let sliceStart = (BLACK_CHUNK_SIZE * this.blackTryCount) + this.blackTryCount;
    let sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
    console.log("try count:", this.blackTryCount,
      "slice start:", sliceStart, "slice end:", sliceEnd);
    console.log(this.blackFilename);
    let slice = mediaFile.slice(sliceStart, sliceEnd);
    if (position === "head") {
      this.blackProgressHead = this.blackTryCount / MAX_TRIES;
    }

    $.when(this.requestBlack(slice, position, filename))
    .then((data, textStatus, jqXHR) => {

      let duration = parseFloat(data.blackDetect[0].duration);
      console.log("this is my black duration, returned from fancy new requestBlack:");
      console.log(duration);
      // stop condition
      if (duration >= MIN_BLACK_TIME) {
        console.log("the detected black duration of", duration,
          "is greater or equal to the min black time of", MIN_BLACK_TIME);
        console.log("so we can stop recursing");
        // TODO set dom values
        this.headBlackStarted = false;
        this.headBlackDetection = data.blackDetect;
        return;
      }

      // TODO any additional stop conditions?

      this.blackTryCount++;
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
        console.log("from my fancy new requestBlack, for the", position);
        console.dir(data.blackDetect);
        // return data.blackDetect;
        // this.tailBlackDetection = data.blackDetect;
        // this.tailBlackStarted = false;

      }
    });
  }

  detectHeadBlack(slice: any, position: string) {
    let self = this;
    let stub: string = "";
    let url = this.endpoint + "black";

    $.ajax({
      type: "POST",
      url: url,
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      // data type that we expect in return
      // dataType: "",
      error: function(err) {
        console.log("you have an error on the black detection ajax request:");
        console.log(err);
      },
      success: (data) => {
        let self = this;
        let increment = 0;
        let offset = BLACK_CHUNK_SIZE + 1;
        console.log("this is what i got from black detection, for the head:");
        console.dir(data.blackDetect);
        let blackDur: number = parseFloat(data.blackDetect[0].duration);
        console.log("black duration:", blackDur);
        this.headBlackDetection = data.blackDetect;
        this.headBlackStarted = false;
        if (blackDur < MIN_BLACK_TIME) {

          console.log("the detected black duration of", blackDur,
            "was less than the min black time of", MIN_BLACK_TIME,
            "So send more money, ma!")


          // TODO calculate next increment
          // TODO send another chunk, along with the file name to concat it to
          // put filename in custom header field
          let incrementalSlice = self.mediaFile.slice(offset,
            offset + BLACK_CHUNK_SIZE);
          $.ajax({
            type: "POST",
            url: url,
            beforeSend: function(request) {
              request.setRequestHeader("xa-file-to-concat",
                data.blackDetect[0].tempFile);
            },
            data: incrementalSlice,
            processData: false,
            contentType: 'application/octet-stream',
            success: (data) => {
              console.log("apparently, the second request was successful: data:");
              console.log(data)
            }
          });
        }

        // todo mediaFile is undefined
        const fileLength = self.mediaFile.size;
        console.log("the file length", fileLength);
        // only process the tail after the head is done
        self.tailBlob = self.mediaFile.slice(fileLength -
          BLACK_CHUNK_SIZE, fileLength);
        self.tailBlackStarted = true;
        self.detectTailBlack(self.tailBlob, "tail");
      }
    });
  }

  detectTailBlack(slice: any, position: string) {
    let self = this;
    let stub: string = "";

    $.ajax({
      type: "POST",
      url: this.endpoint + "black",
      data: slice,
      // don't massage binary to JSON
      processData: false,
      // content type that we are sending
      contentType: 'application/octet-stream',
      // data type that we expect in return
      // dataType: "",
      error: function(err) {
        console.log("you have an error on the black detection ajax request:");
        console.log(err);
      },
      success: function(data) {
        console.log("this is what i got from black detect, for the tail:");
        console.dir(data.blackDetect);
        self.tailBlackDetection = data.blackDetect;
        self.tailBlackStarted = false;
      }
    });
  }

  detectMono() {
    console.log("hiya from the client call to dual mono detection")
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
      this.format = this.processObject(formatObj);
      console.log("format object, from which we can filter extraneous keys:")
      console.log(formatObj);

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
    console.log("location hostname:", window.location.hostname);
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
