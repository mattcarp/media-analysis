import {Component, Pipe, PipeTransform} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";

import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";

const SLICE_SIZE = 100000;
declare var $: any;
declare var FileReader: any;


@Component({
  selector: "analysis-app",
  templateUrl: "src/main.html"
})
export class AnalysisApp {
  results: Object;
  format: Object[];
  ffprobeErr: string;

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
          url: "http://localhost:3000/analysis",
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
          }
        });
      }
    };

    var blob = file.slice(0, SLICE_SIZE);
    reader.readAsBinaryString(blob);
  }

  changeListener($event): void {
    this.readBlob($event.target);
  }

  renderResult(data) {
    if (data.error) {
      this.ffprobeErr = data.error;
    }
    console.log("these are my top-level keys");
    console.log(Object.keys(data));
    let analysisObj = JSON.parse(data.analysis);
    console.log("analysis object, and length:");
    console.log(analysisObj);
    console.log(Object.keys(analysisObj).length);
    if (analysisObj && Object.keys(analysisObj).length !== 0) {
      let formatObj = analysisObj.format;
      this.format = this.processFormat(formatObj);
      console.log("array from format object, with no tags object:");
      console.log(this.format);
    }
 
    // let formatKeys: any = Object.keys(analysisObj.format);
    // console.log("format keys");
    // console.log(formatKeys);
    // results.formatKeys = formatKeys;
    // console.log("format_name:", formatKeys.format_name);
    //
    // console.log("streams keys");
    // console.log(Object.keys(analysisObj.streams)); // ["0", "1", "2"]
    // TODO iterate over streams array
    // console.log("final results:");
    // console.dir(results);
    // this.results = results;
  }

  // takes an object, removes any keys with array values, and returns
  // an array of objects: {key: value}
  // this is handy for ffprobe's format object
  processFormat(formatObj): Object[] {
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

  processFormatTags(formatObj) {

  }

  logError(err) {
    console.log("There was an error: ");
    console.log(err);
  }
}

bootstrap(AnalysisApp);
