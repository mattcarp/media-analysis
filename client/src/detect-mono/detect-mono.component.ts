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
      this.audioResults = detections;
      console.log("not only are you an asshole, but i passed this from the back end:");
      console.log(this.audioResults);
    });

  } // constructor

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }



} // class
