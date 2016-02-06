import {Component, Pipe, PipeTransform} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";

import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";

// initial slice for metadata analysis
const SLICE_SIZE = 150000;

// bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
// TODO send a smaller chunk then send more if we dont have a black_end
const BLACK_CHUNK_SIZE = 200000000;
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

  streams: Object[][]; // an array of arrays of stream objects

  constructor() {
    this.endpoint = "http://localhost:3000/";
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
            let me = this;
            // error handling
            console.log("this is what i got from ffprobe metadata:");
            console.log(data);
            self.renderResult(data);

            let analyisObj = JSON.parse(data.analysis);
            let bitrate = analyisObj.format.bit_rate;
            console.log("bitrate", bitrate);
            console.log("bitrate * 3.1", bitrate * 3.1);

            // TODO -bitrates in metatadata are unreliable -
            // send fixed chunk, then request more bytes and concat if
            // blackDetect shows a black_start but no black_end
            self.headBlob = self.mediaFile.slice(0, BLACK_CHUNK_SIZE);

            self.headBlackStarted = true;
            self.detectBlack(self.headBlob, "head");
            const fileLength = self.mediaFile.size;
            self.tailBlob = self.mediaFile.slice(fileLength -
              BLACK_CHUNK_SIZE, fileLength);
            self.tailBlackStarted = true;
            self.detectBlack(self.tailBlob, "tail");
            console.log("the file length", self.mediaFile.size);

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

  detectBlack(slice: any, position: string) {
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
        if (position === "head") {
          console.log("this is what i got from lack detect, for the head:");
          console.dir(data.blackDetect);
          self.headBlackDetection = data.blackDetect;
          self.headBlackStarted = false;
        }
        if (position === "tail") {
          console.log("this is what i got for black at tail:");
          console.dir(data.blackDetect);
          self.tailBlackDetection = data.blackDetect;
          self.tailBlackStarted = false;
        }
      }
    });
  }

  detectMono() {
    console.log("hiya from dual mono detection")
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
      console.log(formatObj);

      if (formatObj.tags && Object.keys(formatObj.tags).length !== 0) {
        this.formatTags = this.processObject(formatObj.tags);
      }

    }

    if (analysisObj.streams && Object.keys(analysisObj.streams).length !== 0) {
      let collectedStreams = [];
      let inputStreams = analysisObj.streams;
      inputStreams.forEach(currentStream => {
        console.log("i am stream");
        collectedStreams.push(this.processObject(currentStream));
      });

      this.streams = collectedStreams;
    }

  }

  // takes an object, removes any keys with array values, and returns
  // an array of objects: {key: value}
  // this is handy for ffprobe's format and tags object
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
