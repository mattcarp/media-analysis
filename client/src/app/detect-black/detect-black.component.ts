import { Component } from '@angular/core';

import { DetectBlackService } from './detect-black.service';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'detect-black',
  templateUrl: './detect-black.component.html',
  styleUrls: ['./detect-black.component.scss'],
})
export class DetectBlackComponent {
  headBlackStarted: boolean;
  headBlackProgress: number;
  headBlackProgressValue: number;
  headBlackResult: any;

  tailBlackStarted: boolean;
  tailBlackProgress: number;
  tailBlackResult: any;

  constructor(detectBlackService: DetectBlackService, private loggerService: LoggerService) {
    detectBlackService.headBlackStarted.subscribe((value) => {
      this.headBlackStarted = value;
    });
    detectBlackService.tailBlackStarted.subscribe((value) => {
      this.tailBlackStarted = value;
    });
    detectBlackService.headProgress.subscribe((value) => {
      this.headBlackProgress = value * 100;
      this.headBlackProgressValue = value;
    });
    detectBlackService.tailProgress.subscribe((value) => {
      this.tailBlackProgress = value;
    });
    detectBlackService.headBlackResult.subscribe((value) => {
      this.loggerService.info(`I'm subscribing, and should not be undefined: ${typeof value}`, 'color: orange');

      if (value) {
        if (value.blackDetect) {
          this.headBlackResult = value.blackDetect;
        } else {
          this.headBlackResult = value;
        }
        // if (typof )
      }
    });
    detectBlackService.tailBlackResult.subscribe((value) => {
      this.tailBlackResult = value;
    });
  }
}
