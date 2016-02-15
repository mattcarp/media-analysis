import {Component} from 'angular2/core';

import {DetectMonoService} from './detect-mono.service';

declare var $: any;

@Component({
  selector: 'detect-mono',
  templateUrl: 'src/detect-mono/detect-mono.html',
})

export class DetectMonoComponent {
  monoDetectStarted: any;  // event emitter
  monoComplte: any: // event emitter
  detectingMono: boolean;
  monoResults: Object[];
  // ffprobeErr: string;
  // format: Object[];
  // formatTags: Object[];
  // showFormat: boolean = false;
  // streams: Object[][]; // an array of arrays of stream objects

  constructor(detectMonoService: DetectMonoService) {
    this.detectingMono = false;
    this.monoDetectStarted = detectMonoService.monoDetectStarted; // emitter
    this.monoDetectStarted.subscribe(value => {
      if (value === true) { console.log("oh my fucking god mono detect has begun"); }
      this.monoLoading = value;
    });
    this.monoResults = extractMetadataService.monoResults; // emitter
    this.monoResults.subscribe(detections => {
      this.renderResults(detections);
    });

  }



} // class
