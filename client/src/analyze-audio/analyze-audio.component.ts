import {Component} from 'angular2/core';

import {AnalyzeAudioService} from './analyze-audio.service';


@Component({
  selector: 'detect-mono',
  templateUrl: 'src/analyze-audio/analyze-audio.html',
})

export class AnalyzeAudioComponent {
  detectingMono: boolean;
  audioResults: Object[] = [];
  displayMonoDetails: boolean[] = [];
  shouldWarnMono: boolean;
  peakThresholdExceeded: boolean;
  detections: Object[];
  PEAK_THRESHOLD = -6;


  constructor(analyzeAudioService: AnalyzeAudioService) {
    analyzeAudioService.detectStartedEmitter.subscribe(value => {
      if (value === true) { console.log('mono detect has begun'); }
      this.audioResults = [];
      this.detectingMono = value;
    });

    analyzeAudioService.resultsEmitter.subscribe(detections => {
      this.detectingMono = false;
      console.log('mono detection complete: the detection array:');
      console.log(detections);
      this.detections = detections;
      this.validate(detections);
    });

  } // constructor

  validate(detections: any) {
    if (detections.length > 2) {
      if (detections[0].peakLevel > this.PEAK_THRESHOLD ||
        detections[1].peakLevel > this.PEAK_THRESHOLD ||
        detections[2].peakLevel > this.PEAK_THRESHOLD) {
        this.peakThresholdExceeded = true;
      }

      if (detections[0].isMono && detections[1].isMono && detections[2].isMono) {
        this.shouldWarnMono = true;
      }
    }

    // TODOmc results are intermittently ommitted from the view
    this.audioResults = detections;
  }

  showMonoDetails(index: number) {
    this.displayMonoDetails[index] = !this.displayMonoDetails[index];
  }

} // class
