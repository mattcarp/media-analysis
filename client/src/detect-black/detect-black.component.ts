import {Component} from 'angular2/core';

import {DetectBlackService} from './detect-black.service';

declare var $: any;

@Component({
  selector: 'detect-black',
  templateUrl: 'src/detect-black/detect-black.html',
})

export class DetectBlackComponent {
  headBlackStarted: boolean;
  headBlackProgress: number;
  headBlackResult: any;

  tailBlackStarted: boolean;
  tailBlackProgress: number;
  tailBlackResult: any;

  constructor(detectBlackService: DetectBlackService) {
    detectBlackService.headBlackStarted.subscribe(value => {
      this.headBlackStarted = value;
    });
    detectBlackService.tailBlackStarted.subscribe(value => {
      this.tailBlackStarted = value;
    });
    detectBlackService.headProgress.subscribe(value => {
      this.headBlackProgress = value;
    });
    detectBlackService.tailProgress.subscribe(value => {
      this.tailBlackProgress = value;
    });
    detectBlackService.headBlackResult.subscribe(value => {
      this.headBlackResult = value;
    });
    detectBlackService.tailBlackResult.subscribe(value => {
      this.tailBlackResult = value;
    });
  }

}
