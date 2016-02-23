import {Component} from 'angular2/core';

import {DetectMonoService} from './detect-mono.service';

declare var $: any;

@Component({
  selector: 'detect-mono',
  templateUrl: 'src/detect-mono/detect-mono.html',
})

export class DetectMonoComponent {
  detectStartedEmitter: any;
  detectingMono: boolean;
  monoResultsEmitter: any;
  audioResults: any;
  displayMonoDetails: boolean[] = [];
  shouldWarnMono: boolean;
  peakThresholdExceeded: boolean;
  PEAK_THRESHOLD = -6;


  constructor(detectMonoService: DetectMonoService) {
    // this.detectingMono = true;
    this.detectStartedEmitter = detectMonoService.detectStartedEmitter; // emitter
    this.detectStartedEmitter.subscribe(value => {
      if (value === true) { console.log("mono detect has begun"); }
      this.detectingMono = value;
    });
    this.monoResultsEmitter = detectMonoService.resultsEmitter; // emitter
    this.monoResultsEmitter.subscribe(detections => {
      this.detectingMono = false;
      if (detections[0].isMono && detections[1].isMono && detections[2].isMono) {
        this.shouldWarnMono = true;
      }
      console.log("the detection array:");
      console.log(detections);
      if (detections[0].peakLevel > this.PEAK_THRESHOLD ||
        detections[1].peakLevel > this.PEAK_THRESHOLD ||
        detections[2].peakLevel > this.PEAK_THRESHOLD) {
        this.peakThresholdExceeded = true;
      }
      this.audioResults = detections;
      console.log("audio results after mono and peak warnings added:");
      console.log(this.audioResults);
    });

  } // constructor

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }



} // class
