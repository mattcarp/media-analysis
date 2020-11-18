import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class DdpService {
  FRAMES_PER_SECOND = 75;

  constructor(private logger: NGXLogger) {}

  getMasterFormat(nside: string, nlayer: string, type: string) {
    const masterFormat: any = {};
    const numSides = parseInt(nside, 10);
    const numLayers = parseInt(nlayer, 10);
    if (type === 'DV') {
      if (numSides === 1 && numLayers === 1) {
        masterFormat.name = 'DVD-5';
        masterFormat.explanation = 'single sided, single layer';
      }
      if (numSides === 1 && numLayers === 2) {
        masterFormat.name = 'DVD-9';
        masterFormat.explanation = 'single sided, dual layer';
      }
      if (numSides === 2 && numLayers === 1) {
        masterFormat.name = 'DVD-10';
        masterFormat.explanation = 'dual sided, single layer';
      }
      if (numSides === 2 && numLayers === 2) {
        masterFormat.name = 'DVD-18';
        masterFormat.explanation = 'dual sided, dual layer';
      }
    }
    if (type === 'CD') {
      masterFormat.name = 'Audio CD';
      masterFormat.explanation = 'DDP audio disc master';
    }
    return masterFormat;
  }

  // creates a gracenote-compatible table of contents
  createToc(parsedPq: any[]): string {
    const tocArray: number[] = [];
    for (const currentEntry of parsedPq) {
      if (currentEntry.min && parseInt(currentEntry.idx, 10) > 0) {
        tocArray.push(this.timeToFrames(
          currentEntry.min + ':' + currentEntry.sec + ':' + currentEntry.frm
        ));
      }
    }
    // if leadout is repeated, remove last entry
    this.logger.log(tocArray[tocArray.length - 1], tocArray[tocArray.length - 2]);
    if (tocArray[tocArray.length - 1] === tocArray[tocArray.length - 2]) {
      tocArray.pop();
    }
    this.logger.log('toc array');
    this.logger.log(tocArray);
    const toc: string = tocArray.join(' ');
    return toc;
  }

  timeToFrames(timeString: string): number {
    let frames = 0;
    const mins = parseInt(timeString.substr(0, 2), 10);
    const secs = parseInt(timeString.substr(3, 2), 10);
    const frm = parseInt(timeString.substr(6, 2), 10);
    frames = (mins * 60 * 75) + (secs * 75) + frm;
    return frames;
  }

  /**
   * Takes cd frames and returns time string: MM:SS:FF
   * - hours are not used in the DDP 2.0 spec
   * @param   {Number} frames total number of frames
   * @returns {String} time string
   */
  framesToTime(cdFrames: number): string {
    const totalSeconds = Math.floor(cdFrames / this.FRAMES_PER_SECOND);
    const frames = this.padField(cdFrames % this.FRAMES_PER_SECOND);
    const seconds = this.padField(totalSeconds % 60);
    const minutes = this.padField(Math.floor(totalSeconds / 60));
    const timeString = minutes + ':' + seconds + ':' + frames;

    return timeString;
  }

  padField(field: number): string {
    return field.toString().length < 2 ? `0${field}` : `${field}`;
  }

}
