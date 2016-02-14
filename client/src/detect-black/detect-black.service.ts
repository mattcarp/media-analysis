import {EventEmitter, Injectable} from 'angular2/core';

declare var $: any;

@Injectable()
export class DetectBlackService {
  headBlackStarted = new EventEmitter();
  tailBlackStarted = new EventEmitter();
  headBlackResult = new EventEmitter();
  tailBlackResult = new EventEmitter();
  headBlob: any;
  tailBlob: any;
  // mediaFile: File;
  headBlackTryCount: number = 0;
  tailBlackTryCount: number = 0;
  blackProgressHead: number;
  blackProgressTail: number;
  headBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  tailBlackFilename = (Math.random().toString(36) + '00000000000000000').slice(2, 12);
  originalExtension: string;
  headProgress = new EventEmitter();
  tailProgress = new EventEmitter();
  // TODO - this is temp - should call a getEndpoint() service
  endpoint = "http://localhost:3000/";
  MAX_TRIES = 20;
  // use a fixed size chunk as bitrates from ffmpeg are unreliable
  BLACK_CHUNK_SIZE = 1000000;
  // minimum time, in seconds, for black at head and tail
  MIN_BLACK_TIME = 3;

  // is called separately for "head" and "tail" (position string)
  recursiveBlackDetect(mediaFile: File, position: string) {
    let sliceStart;
    let sliceEnd;
    let tailSliceStart;
    let tailSliceEnd;


    // initial stop condition:
    if (position === "head" && this.headBlackTryCount >= this.MAX_TRIES) {
      console.log("max retries exceeded for black detection in file", position);
      // TODO add alert to DOM
      this.headBlackStarted.emit(false);
      return;
    }
    if (position === "tail" && this.tailBlackTryCount >= this.MAX_TRIES) {
      console.log("max retries exceeded for black detection in file", position);
      // TODO add alert to DOM
      this.tailBlackStarted.emit(false);
      return;
    }

    if (position === "head") {
      this.headBlackStarted.emit(true);
      sliceStart = (this.BLACK_CHUNK_SIZE * this.headBlackTryCount) +
      this.headBlackTryCount;
      sliceEnd = sliceStart + this.BLACK_CHUNK_SIZE;
      console.log("head try count:", this.headBlackTryCount,
        "slice start:", sliceStart, "slice end:", sliceEnd);
    }
    if (position === "tail") {
      this.tailBlackStarted.emit(true);
      tailSliceEnd = mediaFile.size -
        (this.BLACK_CHUNK_SIZE * this.tailBlackTryCount) - this.tailBlackTryCount;
      tailSliceStart = tailSliceEnd - this.BLACK_CHUNK_SIZE;
      // sliceEnd = sliceStart + BLACK_CHUNK_SIZE;
      console.log("tail try count:", this.tailBlackTryCount,
        "tail slice start:", tailSliceStart, "tail slice end:", tailSliceEnd);
    }

    let fileToUse;
    let sliceToUse;
    if (position === "head") {
      sliceToUse = mediaFile.slice(sliceStart, sliceEnd);
      this.blackProgressHead = this.headBlackTryCount / this.MAX_TRIES;;
      this.headProgress.emit(this.blackProgressHead);
      fileToUse = this.headBlackFilename + "." + this.originalExtension;
    }
    if (position === "tail") {
      sliceToUse = mediaFile.slice(tailSliceStart, tailSliceEnd);
      console.log("tail try counter:", this.tailBlackTryCount);
      this.blackProgressTail = this.tailBlackTryCount / this.MAX_TRIES;
      this.tailProgress.emit(this.blackProgressTail);
      fileToUse = this.tailBlackFilename + "." + this.originalExtension;
    }


    $.when(this.requestBlack(sliceToUse, position, fileToUse))
      .then((data, textStatus, jqXHR) => {

      if (data.blackDetect[0]) {
        let duration = parseFloat(data.blackDetect[0].duration);
        console.log("this is my black duration, returned from requestBlack:");
        console.log(duration);

        // stop condition
        if (duration >= this.MIN_BLACK_TIME) {
          console.log("the detected black duration of", duration,
            "is greater or equal to the min black time of", this.MIN_BLACK_TIME);
          console.log("so we can stop recursing");
          // TODO set tail dom values
          if (position === "head") {
            this.headBlackStarted.emit(false);
            this.headBlackResult.emit(data.blackDetect);
          }
          if (position === "tail") {
            this.tailBlackStarted.emit(false);
            this.tailBlackResult.emit(data.blackDetect);
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
  } // recursiveBlackDetect

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
  } // requestBlack

} // class
