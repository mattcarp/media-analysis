import {Component, Pipe, PipeTransform} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";

import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";

// initial slice for metadata analysis
const SLICE_SIZE = 25000000;
// incremental amount to be appended to SLICE_SIZE
// TODOmc you're still using slice_size for blackdetect,
// and this should also be calculated via = 3 seconds * bit_rate
const BLACK_SIZE = 25000000;
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
  blackDetectStarted: boolean;
  blackDetection: Object[];

  streams: Object[][]; // an array of arrays of stream objects


  constructor() {
    this.endpoint = this.setEndpoint();
  }

  readBlob(target: any) {
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
          success: function(data) {
            // error handling
            console.log("this is what i got from ffprobe:");
            console.log(data);
            self.renderResult(data);
            // TODO pass ~3 secs of file, based on bitrate
            // TODO the value for the analysis key is one huge string -
            // need to eval() it
            let format = data.analysis.format;
            console.log("format key", format);
            // TODO don't use blob
            self.detectBlack(blob);
            self.detectMono();
          }
        });
      }
    };

    let blob = file.slice(0, SLICE_SIZE);
    let blackBlob = file.slice(0, BLACK_SIZE);
    reader.readAsBinaryString(blob);
  }

  changeListener($event): void {
    this.readBlob($event.target);
  }

  detectBlack(slice) {
    let self = this;
    let stub: string = "";
    self.blackDetectStarted = true;

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
        console.log("this is what i got from ffprobe black detect:");
        console.dir(data.blackDetect);
        self.blackDetection = data.blackDetect;
        self.blackDetectStarted = false;
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

      if (formatObj.tags && Object.keys(formatObj.tags).length !==0) {
        this.formatTags = this.processObject(formatObj.tags);
      }

    }

    if (analysisObj.streams && Object.keys(analysisObj.streams).length !==0) {
      // TODO use array.foreach to process each stream and return an array of arrays
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

  setEndpoint() {
    console.log("location hostname:", window.location.hostname);
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000/";
    } else {
      return "http://52.0.119.124:3000/";
    }

  }

  logError(err) {
    console.log("There was an error: ");
    console.log(err);
  }
}

bootstrap(AnalysisApp);
