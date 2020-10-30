import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { DdpState } from '../reducers/ddp.reducer';
import { DdpService } from './ddp.service';
import { PqEntry, PqState } from '../models';


@Injectable({
  providedIn: 'root',
})
export class DdppqService {
  constructor(private ddpService: DdpService, private store: Store<DdpState>) {}

  static parseSingleBlock(block) {
    const blockObj: any = {};
    // DDP Spec v. 2.0 page 23
    blockObj.spv = block.substring(0, 4);
    blockObj.trk = block.substring(4, 6).trim();
    blockObj.idx = block.substring(6, 8);
    blockObj.hrs = block.substring(8, 10).trim(); // hrs are reserved in the spec
    blockObj.min = block.substring(10, 12).trim();
    blockObj.sec = block.substring(12, 14).trim();
    blockObj.frm = block.substring(14, 16).trim();
    blockObj.cb1 = block.substring(16, 18);
    blockObj.cb2 = block.substring(18, 20);
    blockObj.isrc = block.substring(20, 32);
    blockObj.upc = block.substring(32, 45);
    blockObj.txt = block.substring(45, 64).trim();

    return blockObj;
  }

  parse(pqContent) {
    const BLOCK_SIZE = 64;
    let currentBlock = [];
    const pqArr = [];


    // divide pq content into 64 byte blocks
    const re = new RegExp('.{1,' + BLOCK_SIZE + '}', 'g');
    const entriesArr = pqContent.match(re);
    for (let i = 0; i < entriesArr.length; i++) {
      currentBlock = DdppqService.parseSingleBlock(entriesArr[i]);
      pqArr[i] = currentBlock;
    }
    // add in the gaps and durations, which aren't in the spec
    // TODO these cause mutations to pqAmended - write as pure functions
    let pqAmended: PqEntry[] = this.insertGaps(pqArr);
    pqAmended = this.insertDurations(pqAmended);
    console.log('the amended pq, should have durations:', pqAmended);
    const parsedPq: PqState = {
      fileName: 'bubbafile',
      fileSize: 122345,
      lastModified: new Date(),
      entries: pqAmended
    };
    this.store.dispatch({type: 'SET_DDPPQ', payload: parsedPq});
  }

  getTrackCount(pqArr) {
    let trackCount = 0;
    let currentTrack = 0;
    for (let i = 0; i < pqArr.length; i++) {
      currentTrack = parseInt(pqArr[i].trk, 10);
      if (!isNaN(currentTrack) && currentTrack > trackCount) {
        trackCount = currentTrack;
      }

    }
    return trackCount;
  }

  // TODmc this method is also in ddp.service - should call it from there
  timeToFrames(timeString) {
    const mins = parseInt(timeString.substr(0, 2), 10);
    const secs = parseInt(timeString.substr(3, 2), 10);
    const frm = parseInt(timeString.substr(6, 2), 10);
    return (mins * 60 * 75) + (secs * 75) + frm;
  }

  // add the gaps before a track starts (not part of the spec)
  insertGaps(pqArr) {
    const pqArrWithGaps = pqArr;

    for (let i = 0; i < pqArr.length; i++) {
      pqArrWithGaps[i] = pqArr[i];
      // only add the pauses on the track's index 1 entry
      if (pqArr[i].idx.trim() === '01' && pqArr[i].trk.trim() !== 'AA') {
        const pauseStart = pqArr[i - 1].min + ':' + pqArr[i - 1].sec + ':' +
          pqArr[i - 1].frm;
        const trackStart = pqArr[i].min + ':' + pqArr[i].sec + ':' +
          pqArr[i].frm;
        const startFrame = this.timeToFrames(pauseStart);
        const endFrame = this.timeToFrames(trackStart);
        const gap = endFrame - startFrame;
        pqArrWithGaps[i].preGap = gap;
      }
    }

    return pqArrWithGaps;
  }

  // add the durations (including pause) for each track
  // (not part of the spec)
  insertDurations(pqArr: PqEntry[]) {
    // copy the array so we can modify while iterating
    // TODO arrays are passed by reference - this is not a copy! maybe use .splice
    const pqArrWithDurations = pqArr;
    let nextPauseStart = '';

    for (let i = 0; i < pqArr.length; i++) {
      pqArrWithDurations[i] = pqArr[i];
      // only add the duratons on the track's index 1 entry
      if (pqArr[i].idx.trim() === '01' && pqArr[i].trk.trim() !== 'AA') {
        const trackStart = pqArr[i].min + ':' + pqArr[i].sec + ':' +
          pqArr[i].frm;
        let j = i;
        // look for the next index 0, which is on the next track number
        for (j; j < pqArr.length; j++) {
          const currentTrack = parseInt(pqArr[i].trk, 10);
          // for the last track, next track is the leadout (AA)
          const isLeadout = pqArr[j].trk.trim().toUpperCase() === 'AA' &&
            pqArr[j].idx.trim() === '01';
          if ((pqArr[j].idx.trim() === '00' && currentTrack + 1 ===
            parseInt(pqArr[j].trk, 10)) || isLeadout) {

            nextPauseStart = pqArr[j].min + ':' + pqArr[j].sec + ':' +
              pqArr[j].frm;
            break;
          }

        }
        // console.log('trackStart', trackStart, 'for', parseInt(pqArr[i].trk, 10));
        const startFrame = this.timeToFrames(trackStart);
        const endFrame = this.timeToFrames(nextPauseStart);
        // console.log('trackEnd', nextPauseStart);
        const dur = endFrame - startFrame;
        // console.log(parseMs().framesToTime(dur));
        pqArrWithDurations[i].dur = this.ddpService.framesToTime(dur);
        // console.log('dur', this.ddpService.framesToTime(dur));

      }
    }
    return pqArrWithDurations;
  }

  // takes a list of audio entries for the player, and adds pq info
  addPqToAudio(audioEntries: any[], parsedPq: PqState) {
    // don't modify an array that you're iterating on - TODO you just pointed to the same array
    const result: any[] = audioEntries;
    const pqEntries: PqEntry[] = parsedPq.entries;
    for (let i = 0; i < parsedPq.entries.length ; i++) {
      for (let j = 0; j < audioEntries.length; j ++) {
        if (pqEntries[i].trk === audioEntries[j].trk) {
          if (pqEntries[i].idx === '01') {
            // if there's no isrc on this index, and the prior entry is for the
            // same track, get isrc from there
            if (pqEntries[i].isrc.trim() === '') {
              result[j].isrc = pqEntries[i - 1].isrc;
            } else {
              result[j].isrc = pqEntries[i].isrc;
            }
            result[j].dur = pqEntries[i].dur;
            result[j].preGap = pqEntries[i].preGap;
          }
        }
      }
    }
    return result;
  }
}
