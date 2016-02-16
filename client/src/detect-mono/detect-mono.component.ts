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
  monoResults: any;
  displayMonoDetails: boolean[] = [];

  constructor(detectMonoService: DetectMonoService) {
    this.detectingMono = true;
    this.detectStartedEmitter = detectMonoService.detectStartedEmitter; // emitter
    this.detectStartedEmitter.subscribe(value => {
      if (value === true) { console.log("mono detect has begun"); }
      this.detectingMono = value;
    });
    this.monoResultsEmitter = detectMonoService.resultsEmitter; // emitter
    this.monoResultsEmitter.subscribe(detections => {
      this.detectingMono = true;
      console.log("bang mono detect returned:");
      console.log(detections);
      this.monoResults = detections;
    });

  } // constructor

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }



} // class
