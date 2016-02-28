import {Component} from "angular2/core";

import {DetectMonoService} from "./detect-mono.service";


@Component({
  selector: "detect-mono",
  templateUrl: "src/detect-mono/detect-mono.html",
})

export class DetectMonoComponent {
  detectingMono: boolean;
  audioResults: Object[] = [];
  displayMonoDetails: boolean[] = [];
  shouldWarnMono: boolean;
  peakThresholdExceeded: boolean;
  PEAK_THRESHOLD = -6;


  constructor(detectMonoService: DetectMonoService) {
    detectMonoService.detectStartedEmitter.subscribe(value => {
      if (value === true) { console.log("mono detect has begun"); }
      this.audioResults = [];
      this.detectingMono = value;
    });

    detectMonoService.resultsEmitter.subscribe(detections => {
      this.detectingMono = false;
      console.log("detect mono component constructor: the detection array:");
      console.log(detections);
      this.validate(detections);
    });

  } // constructor

  validate(detections: any) {
    // clear the state - TODO this doesn't work - use redux pattern
    // this.audioResults = [];
    console.log("these are my new detections, welcome!", detections);

    if (detections.length > 2) {
      if (detections.front.peakLevel > this.PEAK_THRESHOLD ||
        detections.middle.peakLevel > this.PEAK_THRESHOLD ||
        detections.end.peakLevel > this.PEAK_THRESHOLD) {
        this.peakThresholdExceeded = true;
      }

      if (detections.front.isMono && detections.middle.isMono && detections.end.isMono) {
        this.shouldWarnMono = true;
      }
    }
    console.log("gonna hand this to the view:", detections);
    // convert object to array so we can iterate in the view
    let resultArr = Object.keys(detections).map(key => detections[key]);
    console.log("audio results as an array", resultArr);
    this.audioResults = resultArr;
  }

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }



} // class
