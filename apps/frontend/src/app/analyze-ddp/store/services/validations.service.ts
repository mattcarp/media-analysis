import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { DdpState } from '../reducers/ddp.reducer';
import { DdpmsService } from './ddpms.service';
import { DdpService } from './ddp.service';
import { setValidationState } from '../actions/ddp.actions';
import { IdState, MsState } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ValidationsService {
  TRK_ONE_PREGAP = 150;
  AUDIO_ID_FILE_SIZE = 128;
  DDPID_FILE_NAME = 'DDPID';

  constructor(
    private ddpmsService: DdpmsService,
    private ddpService: DdpService,
    private store: Store<DdpState>,
    private logger: NGXLogger,
  ) {}

  validate(collectedFileInfo, parsedMs, parsedId): void {
    const validation: any = {};

    // TODO take isConforming from AOMA ddpUtils.js
    // var isConforming = true;
    // TODO write method to check for subindices, show warning
    const hasSubindices = false;
    const sizeMismatches = [];
    // var gapMismatches = [];
    // var durationMismatches;

    const fileStatus: any = this.getFileStatus(
      collectedFileInfo,
      parsedMs,
      parsedId,
    );
    validation.missingFiles = fileStatus.missingFiles;
    validation.foundFiles = fileStatus.foundFiles;
    validation.sizeMismatches = fileStatus.sizeMismatches;
    validation.sizeMatches = fileStatus.sizeMatches;
    const totalFrames = this.ddpmsService.getOverallDuration(parsedMs);
    validation.durationWarning = this.getDurationWarning(totalFrames);
    // let trackCount = ''; // todomc get track count
    // validation.trackCountWarning = this.getTrackCountWarning();

    this.logger.log('file status', fileStatus);
    if (fileStatus.isValid === false || validation.pqMsIssues.length) {
      validation.isValid = false;
    }

    // TODOmc write code that checks for subindices while iterating over pq
    validation.hasSubindices = hasSubindices;

    validation.pqMsIssues = this.getPqMsIssues(parsedMs, parsedId);
    validation.totalFails =
      fileStatus.missingFiles.length +
      sizeMismatches.length +
      validation.pqMsIssues.length;
    // TODOmc add pqMsPasses to length of total passes
    validation.totalPasses =
      fileStatus.foundFiles.length + fileStatus.sizeMatches.length;
    // +  validation.pqMsPasses.length;
    this.logger.log('gonna set these validations on the store', validation);

    this.store.dispatch(setValidationState({ validation }));
  }

  /**
   * Checks for missing and improperly-sized files
   * @param collectedFileInfo file names and sizes from the directory
   * @param parsedMs          map Stream entries as objects
   * @param parsedId          DDPID entries as objects
   */
  getFileStatus(
    collectedFileInfo: any,
    parsedMs: MsState,
    parsedId: IdState,
  ): any {
    const response: any = {};
    let foundFileName;
    let foundFileSize;
    let reqFileName;
    let reqFileSize = '';
    let fileExists = false;
    const missingFiles = [];
    const foundFiles = [];
    const sizeMatches = [];
    const sizeMismatches = [];
    const requiredFiles = parsedMs.entries;
    let isValid = false;

    for (let i = 0; i < requiredFiles.length; i += 1) {
      fileExists = false;
      reqFileName = requiredFiles[i].dsi;
      reqFileSize = requiredFiles[i].dsl;

      for (let j = 0; j < collectedFileInfo.length; j += 1) {
        foundFileName = collectedFileInfo[j].name;
        foundFileSize = collectedFileInfo[j].size;

        if (
          reqFileName.trim().toLowerCase() ===
          foundFileName.trim().toLowerCase()
        ) {
          fileExists = true;
          foundFiles.push({ name: reqFileName, size: reqFileSize });

          if (reqFileSize === foundFileSize) {
            // this.logger.log(reqFileName + ': file sizes match');
            sizeMatches.push({ name: reqFileName, reqSize: reqFileSize });
          } else if (reqFileName !== 'DDPID' && reqFileSize !== foundFileSize) {
            isValid = false;
            // console.warn(reqFileName + ': file sizes DO NOT match');
            const sizeDiff: number =
              parseInt(foundFileSize, 10) - parseInt(reqFileSize, 10);
            sizeMismatches.push({
              name: reqFileName,
              reqSize: reqFileSize,
              actualSize: foundFileSize,
              diff: sizeDiff,
            });
          }
          // this.logger.log(reqFileName + ' was found in the directory');
        }
      }
      if (!fileExists) {
        isValid = false;

        missingFiles.push({ name: reqFileName, reqSize: reqFileSize });
      }
    }
    this.logger.log('req files?', requiredFiles);
    // DDPID file is not in the map stream, but is required

    if (requiredFiles) {
      // requireFiles is now immutable - must return a copy
      // have to respect the interface
      // TODO you need to use newReqFils in place of requiredFiles
      const newReqFiles = requiredFiles.concat({
        dst: '',
        dsi: this.DDPID_FILE_NAME,
        dsp: '',
        mpv: '',
        dsl: this.AUDIO_ID_FILE_SIZE.toString(10),
        dss: '',
        sub: '',
        cdm: '',
        ssm: '',
        scr: '',
        pre1: '',
        pre2: '',
        pst: '',
        med: '',
        trk: '',
        idx: '',
        isrc: '',
        siz: '',
        new_: '', // 'new' is a JS keyword
        pre1nxt: '',
        pauseadd: '',
        ofs: '',
        pad: '',
      });
      this.logger.log('did we get past the concat?');
    }

    // if audio, DDPID should be 128 bytes
    // this is a special case because the size of the DDPID is not in the map stream
    if (parsedId?.type_ === 'CD') {
      if (parsedId.fileSize !== this.AUDIO_ID_FILE_SIZE) {
        this.logger.log('size mismatches:', sizeMismatches);
        sizeMismatches.push({
          name: this.DDPID_FILE_NAME,
          reqSize: this.AUDIO_ID_FILE_SIZE,
          actualSize: parsedId.fileSize,
          diff: parsedId.fileSize - this.AUDIO_ID_FILE_SIZE,
        });
      } else if (parsedId.fileSize === this.AUDIO_ID_FILE_SIZE) {
        sizeMatches.push({
          name: this.DDPID_FILE_NAME,
          reqSize: this.AUDIO_ID_FILE_SIZE,
        });
      }
    }

    response.isValid = isValid;
    response.missingFiles = missingFiles;
    response.sizeMatches = sizeMatches;
    response.sizeMismatches = sizeMismatches;
    response.foundFiles = foundFiles;
    this.logger.log('get file status is returning:', response);
    return response;
  }

  /**
   * Warn user if track count exceeds Red Book spec
   * @param   {Number} trackCount number of tracks on DDP
   * @returns {String} warning message
   */
  getTrackCountWarning(trackCount): string {
    // const MAX_TRACK_COUNT = 99; // Red Book standard
    const MAX_TRACK_COUNT = 2;
    const result: any = {};
    const TRK_COUNT_MSG = `This DDP contains more than 99 tracks and doesn't comply with
     the Red Book standard for disc manufacturing. Since it cannot be manufactured as a
     Compact Disc, please consider creating this master using individual WAV files or as
     part of a multi-disc set.`;
    if (trackCount > MAX_TRACK_COUNT) {
      result.msg = TRK_COUNT_MSG;
      result.shouldBlock = true;
    } else {
      result.msg = null;
      result.shouldBlock = false;
    }
    return result;
  }

  /**
   * Presents progressive warnings on overall duration and eventually
   * prevents the user from proceeding
   */
  // TODOmc this is randomly throwing > 99 minute warnings
  getDurationWarning(frames): [] {
    // const THRESHOLD_1 = 356250; // 79:10:00
    const THRESHOLD_1 = 5;
    const THRESHOLD_1_MSG = `The master submitted has a play length which is
    longer than the Red Book
    specification of 79 minutes and 10 seconds. If this master is i
    ntended to be manufactured, be aware that
    some communication with the manufacturer may be necessary to ensure successful production.`;
    const THRESHOLD_2 = 360750; // 80:10:00
    const THRESHOLD_2_MSG = `The master submitted exceeds the play length that can normally be
    manufactured as a Compact Disc. Dependent on the manufacturer, this limit can be exceeded,
    please contact the disc manufacturer for confirmation. This master can be registered in AOMA
    but be aware that it may only be physically manufactured in select plants or for electronic
    distribution and archival purposes. Do you want to continue?`;
    const THRESHOLD_3 = 402750; // 89:30:00
    const THRESHOLD_3_MSG = `The master submitted exceeds the play length that can be
    manufactured as a Compact Disc. This master can be registered in AOMA but please
    be aware that it will only be available for electronic distribution and archival purposes.`;
    const THRESHOLD_4 = 449999; // 99:59:74
    const THRESHOLD_4_MSG = `The DDP master that was submitted has a play length of 100 minutes
    or more. This type of master cannot be manufactured and will cause errors with systems that
    process DDP audio. The system cannot continue with this registration.`;

    const returnObj: any = {};

    if (frames <= THRESHOLD_1) {
      this.logger.log('frames are less than threshold 1');
      returnObj.msg = null;
      returnObj.shouldBlock = false;
    }
    if (frames > THRESHOLD_1 && frames < THRESHOLD_2) {
      returnObj.msg = THRESHOLD_1_MSG;
      returnObj.shouldBlock = false;
    }
    if (frames >= THRESHOLD_2 && frames < THRESHOLD_3) {
      returnObj.msg = THRESHOLD_2_MSG;
      returnObj.shouldBlock = false;
    }
    if (frames >= THRESHOLD_3 && frames <= THRESHOLD_4) {
      returnObj.msg = THRESHOLD_3_MSG;
      returnObj.shouldBlock = false;
    }
    if (frames > THRESHOLD_4) {
      returnObj.msg = THRESHOLD_4_MSG;
      returnObj.shouldBlock = true;
    }
    return returnObj;
  }

  /**
   * Looks for discrepancies in timing and gap length between the PQ and MS files
   * @param   {Array} msArray       [[Description]]
   * @param   {Array} pqWithGapsArr [[Description]]
   * @returns {Object} [[Description]]
   */
  // TODO this is totally broken
  getPqMsIssues(msArray, pqWithGapsArr): any {
    const issues: any = [];
    let issue: any = {};

    for (let i = 0; i < msArray.length; i += 1) {
      const msIdx = parseInt(msArray[i].idx, 10);
      const msTrk = parseInt(msArray[i].trk, 10);
      const msGap = parseInt(msArray[i].pre2, 10);
      const msTotalDur = parseInt(msArray[i].dsl, 10);
      const msDur = this.ddpService.framesToTime(msTotalDur - msGap);

      for (let j = 0; j < pqWithGapsArr.length; j += 1) {
        const pqEntry = pqWithGapsArr[j];
        const pqTrk = parseInt(pqEntry.trk, 10);
        const pqIdx = parseInt(pqEntry.idx, 10);
        const pqGap = parseInt(pqEntry.preGap, 10);
        const pqDur = pqEntry.dur;

        // check for 150 pregap on track 1
        if (msTrk === 1 && msIdx === 1 && pqTrk === 1 && pqIdx === 1) {
          if (msGap !== this.TRK_ONE_PREGAP || pqGap !== this.TRK_ONE_PREGAP) {
            issue.issueType = 'trk1Pregap';
            issue.trk = pqTrk;
            issue.idx = pqIdx;
            issue.msGap = msGap;
            issue.pqGap = pqGap;
            issue.pqDur = pqDur;
            issue.msDur = msDur;
            issue.pqDur = pqDur;
            issues.push(issue);
            issue = {};
          }
        }
        if (msTrk === pqTrk && msIdx === pqIdx) {
          if (msGap !== pqGap) {
            issue.issueType = 'gapMismatch';
            issue.msGap = msGap;
            issue.pqGap = pqGap;
            issue.gapDiff = msGap - pqGap;
            issue.trk = msTrk;
            issue.idx = msIdx;
            issue.pqDur = pqDur;
            issue.msDur = msDur;
            issues.push(issue);
            issue = {};
          }

          if (msDur !== pqDur) {
            issue.issueType = 'durMismatch';
            issue.trk = msTrk;
            issue.idx = msIdx;
            issue.pqDur = pqDur;
            issue.msDur = msDur;
            issue.msGap = msGap;
            issue.pqGap = pqGap;
            issues.push(issue);
            issue = {};
          }
        }
      }
    }
    return issues;
  }
}
