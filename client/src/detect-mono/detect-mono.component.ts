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
  shouldWarn: boolean;


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
        this.shouldWarn = true;
      }
      this.monoResults = detections;
    });

  } // constructor

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }



} // class
