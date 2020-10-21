import { Component } from '@angular/core';

import { AnalyzeAudioService } from './analyze-audio.service';

@Component({
  selector: 'analyze-audio',
  templateUrl: './analyze-audio.component.html',
})
export class AnalyzeAudioComponent {
  detectingMono: boolean;
  audioResults: [];
  displayMonoDetails: boolean[] = [];
  shouldWarnMono: boolean;
  peakThresholdExceeded: boolean;
  detections: [];
  segmentAnalyses: string[][];
  PEAK_THRESHOLD = -6;

  constructor(analyzeAudioService: AnalyzeAudioService) {
    analyzeAudioService.detectStartedEmitter.subscribe(value => {
      if (value === true) {
        console.log('mono detect has begun');
      }
      this.audioResults = [];
      this.detectingMono = value;
    });

    analyzeAudioService.resultsEmitter.subscribe(detections => {
      this.detectingMono = false;
      console.log('mono detection complete: the detection array:');
      console.log(detections);
      this.formatDetections(detections);
      this.detections = detections;
      this.validate(detections);
    });
  } // constructor

  formatDetections(detections = []) {
    const resultArr: string[][] = [];

    detections.map((analysis, index) => {
      // this.formatAudioData(analysis.data);
      resultArr[index] = this.formatAudioData(analysis.data);
    });
    this.segmentAnalyses = resultArr;
  }

  formatAudioData(data = []) {
    const result = [];
    data.map((item, index) => {
      if (index === 0) {
        result.push('           ' + item);
      } else {
        result.push(item);
      }
    });
    console.log('result of formatting the audio analysis:', result);
    // this.segmtentAnalyses = result;
    return result;
  }

  validate(detections: any) {
    if (detections.length > 2) {
      if (
        detections[0].peakLevel > this.PEAK_THRESHOLD ||
        detections[1].peakLevel > this.PEAK_THRESHOLD ||
        detections[2].peakLevel > this.PEAK_THRESHOLD
      ) {
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
}
