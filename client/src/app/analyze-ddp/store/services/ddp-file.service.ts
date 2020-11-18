import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { DdpState } from '../reducers/ddp.reducer';
import {
  setAudioEntries,
  setDdpFiles,
  setPlayerAnnotation,
  setPqState,
} from '../actions/ddp.actions';
import { selectMs, selectPq } from '../selectors/ddp.selectors';
import { MsEntry, MsState, PlayerAnnotationState, PqState } from '../models';
import { DdpService } from './ddp.service';
import { DdpmsService } from './ddpms.service';
import { DdpidService } from './ddpid.service';
import { DdppqService } from './ddppq.service';
import { GracenoteService } from './gracenote.service';
import { CdTextService } from './cdtext.service';
import { LoggerMonitor } from '@app/analyze-ddp/store/services/logger-monitor';

@Injectable({
  providedIn: 'root',
})
export class DdpFileService implements OnDestroy {
  static loggerS: NGXLogger;
  parseStartTime: Date = new Date();
  waveSurferInstance: any;
  parsedMs: MsState;
  parsedPq: PqState;
  parsedId: any[];
  audioEntries: any[];
  // playlist is an array of resumable files
  playList: any[];
  audioSource: any;
  files: any[];
  showWaveform = false;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private ddpService: DdpService,
    private ddpmsService: DdpmsService,
    private ddpidService: DdpidService,
    private ddppqService: DdppqService,
    private gracenoteService: GracenoteService,
    private cdTextService: CdTextService,
    private store: Store<DdpState>,
    private logger: NGXLogger,
  ) {
    DdpFileService.setLoggerS(logger);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleFiles(waveSurferInstance: any, files: any): void {
    this.files = files;
    this.parseStartTime = new Date();
    this.logger.log('all files have been added');
    this.store.dispatch(setDdpFiles({ selectedAt: new Date(), files }));
    this.waveSurferInstance = waveSurferInstance;

    files.forEach((file) => {
      if (file.name.toLowerCase() === 'ddpms') {
        this.readAndParse(file, 'ms');
      }
      if (file.name.toLowerCase() === 'ddpid') {
        this.readAndParse(file, 'id');
      }
    });
  }

  handlePqFile(pqFileInfo: any, files: any[]): void {
    // a pq file can have any name given to it by the ms file
    const fileName: string = pqFileInfo.fileName.trim().toLowerCase();

    files.forEach((file) => {
      if (file.name.toLowerCase() === fileName) {
        this.readAndParse(file, 'pq');
        this.store.pipe(
          select(selectPq),
          filter((pq: PqState) => !!pq),
          takeUntil(this.destroy$),
        ).subscribe((pq: PqState) => {
          this.parsedPq = pq;
          const toc = this.ddpService.createToc(pq.entries);
          this.gracenoteService.queryByToc(toc);
        });
      }
    });
  }

  // TODOmc handle consolidated DDP by reading in track-length portions
  readAudioFile(audioFile: File): void {
    const reader = new FileReader();
    let audioBuf: ArrayBuffer = null;

    reader.onload = (e: any) => {
      audioBuf = e.target.result;
      this.queueTrack(audioBuf);
    };
    reader.readAsArrayBuffer(audioFile);
  }

  queueTrack(audioBuff: ArrayBuffer): void {
    if (!AudioContext) {
      alert(
        'Your browser does not support any AudioContext and cannot play back this audio.',
      );
      return;
    }
    // clear player annotations
    const params: PlayerAnnotationState = {
      start: null,
      end: null,
      msgType: null,
      msg: null,
    };
    this.store.dispatch(setPlayerAnnotation(params));
    const audioCtx = new AudioContext();
    const encodedWav = DdpFileService.encodeWav(audioBuff);
    this.audioSource = audioCtx.createBufferSource();
    // convert ArrayBuffer to Blob, in order to draw waveform
    const dataView = new DataView(encodedWav);
    const blob = new Blob([dataView], { type: 'mimeString' });
    this.createWaveForm(blob);
  }

  createWaveForm(waveBuffer: Blob): void {
    this.waveSurferInstance.loadBlob(waveBuffer);
  }

  addRegion(start: number, end: number): void {
    this.waveSurferInstance.on('ready', () => {
      this.showWaveform = true;
      this.waveSurferInstance.clearRegions();
      this.waveSurferInstance.addRegion({
        start, // time in seconds
        end, // time in seconds
        drag: false,
        resize: false,
        color: 'hsla(221, 48%, 58%, 0.5)',
        data: 'at some point will use this',
      });
      this.waveSurferInstance.on('region-in', this.showInMsg.bind(this));
      this.waveSurferInstance.on('region-out', this.showOutMsg.bind(this));
    });
  }

  showInMsg(region: any): void {
    const params: PlayerAnnotationState = {
      start: this.ddpService.framesToTime(region.start * 75),
      end: this.ddpService.framesToTime(region.end * 75),
      msgType: 'in',
      msg: 'playing from index 0',
    };
    this.store.dispatch(setPlayerAnnotation(params));
  }

  showOutMsg(region: any): void {
    const params: PlayerAnnotationState = {
      start: this.ddpService.framesToTime(region.end * 75),
      end: 'end of file',
      msgType: 'in',
      msg: 'playing from index 1',
    };
    this.store.dispatch(setPlayerAnnotation(params));
  }

  static setLoggerS(logger: NGXLogger) {
    DdpFileService.loggerS = logger;
  }

  static encodeWav(rawAudio: ArrayBuffer): ArrayBuffer {
    // wav header is 44 bytes
    const HEADER_LENGTH = 44;
    const buffer = new ArrayBuffer(HEADER_LENGTH);
    const view = new DataView(buffer);

    const NUM_CHANNELS = 2;
    const BIT_DEPTH = 16;
    const SAMPLE_RATE = 44100;

    // RIFF identifier
    DdpFileService.writeString(view, 0, 'RIFF');
    // RIFF chunk length
    view.setUint32(4, 36 + rawAudio.byteLength, true);
    // RIFF type
    DdpFileService.writeString(view, 8, 'WAVE');
    // format chunk identifier
    DdpFileService.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count
    view.setUint16(22, NUM_CHANNELS, true);
    // sample rate
    view.setUint32(24, SAMPLE_RATE, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, SAMPLE_RATE * 4, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, NUM_CHANNELS * 2, true);
    // bits per sample
    view.setUint16(34, BIT_DEPTH, true);
    // data chunk identifier
    DdpFileService.writeString(view, 36, 'data');
    // data chunk length
    // TODOmc certain ddps throw: RangeError: byte length of Uint32Array should be a multiple of 4
    DdpFileService.loggerS.log(
      'the byte length for this Uint32 array , which might not be divisible by 4, is',
      rawAudio.byteLength,
    );
    // view.setUint32(40, rawAudio.byteLength, true);
    /// TODOmc temp hard-coding 32 - should use rawAudio.byteLEngth
    // view.setUint32(40, 32, true);
    view.setFloat32(40, rawAudio.byteLength, true);

    DdpFileService.loggerS.log('first 120 chars of view buffer:');
    DdpFileService.loggerS.log(
      String.fromCharCode.apply(
        null,
        new Uint8Array(view.buffer.slice(0, 120)),
      ),
    );

    return DdpFileService.appendBuffer(view.buffer, rawAudio);
  }

  static writeString(view, offset, text): void {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  // concat two ArrayBuffers (e.g. the wav header and audio payload)
  static appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  }

  getPqFileInfo(msObj: MsState): any {
    const pqFileInfo: any = {};

    if (msObj === null) {
      return null;
    }
    const msEntries: MsEntry[] = msObj.entries;

    for (let i = 0; i < msEntries.length; i++) {
      const currentEntry = msEntries[i];

      if (currentEntry.sub.trim().toUpperCase() === 'PQ DESCR') {
        pqFileInfo.fileName = currentEntry.dsi.trim();
        // parseInt will eliminate leading zeros
        // - always supply radix or you could get octal
        pqFileInfo.fileSize = parseInt(currentEntry.dsl, 10);
        // don't keep going
        return pqFileInfo;
      }
    }
    return null;
  }

  getCdTextFileInfo(parsedMs: any): any {
    const cdTextFileInfo: any = {};

    if (parsedMs === null || parsedMs === '') {
      return null;
    }

    for (const currentEntry of parsedMs.entries) {
      if (currentEntry.sub.trim().toUpperCase() === 'CDTEXT') {
        cdTextFileInfo.fileName = currentEntry.dsi;
        // parseInt will eliminate leading zeros
        // always supply radix or you could get octal
        cdTextFileInfo.fileSize = parseInt(currentEntry.dsl, 10);
        // don't keep going
        return cdTextFileInfo;
      }
    }
  }

  // reads small ASCII text files (e.g. DDPMS, DDPID, PQ) and calls parses
  readAndParse(fileObj: any, fileType: string): void {
    const textReader: FileReader = new FileReader();
    textReader.onloadend = (e) => {
      switch (fileType) {
        case 'pq':
          // TODO set in store by calling parse, then get from store
          this.ddppqService.parse(textReader.result);
          this.store
            .pipe(select(selectPq), takeUntil(this.destroy$))
            .subscribe((pq: PqState) => {
              this.logger.log('we should have a parsed pq at this point', pq);
              const audioWithPq: any[] = this.ddppqService.addPqToAudio(
                this.audioEntries,
                pq,
              );
              this.logger.log('this is my audio with pq stuff', audioWithPq);
              this.store.dispatch(
                setAudioEntries({ audioEntries: audioWithPq }),
              );
              // set up the first track for playback
              const trk1Pregap = parseFloat(audioWithPq[0].preGap) / 75.0;
              this.addRegion(0, trk1Pregap);
              this.store.dispatch(setPqState({ pq }));
            });
          break;
        case 'id':
          this.ddpidService.parse(textReader.result.toString(), fileObj);
          break;
        case 'ms':
          this.ddpmsService.parse(textReader.result.toString(), fileObj);
          this.store.pipe(
            select(selectMs),
            filter((ms: MsState) => !!ms),
            takeUntil(this.destroy$),
          ).subscribe((ms: MsState) => {
            // this.hasMs = true;
            // TODO get the parsedMs info from the store, put audio entries in the store
            this.audioEntries = this.ddpmsService.getAudioEntries(ms);
            const pqFileInfo: any = this.getPqFileInfo(ms);
            this.logger.log('parsed ms:', ms);
            this.handlePqFile(pqFileInfo, this.files);
            const cdTextFileInfo = this.getCdTextFileInfo(ms);
            if (cdTextFileInfo) {
              this.cdTextService.getFile(cdTextFileInfo, this.files);
            }
            this.logger.log('audio entries', this.audioEntries);
          });
          break;
        default:
          break;
      }
    };
    textReader.readAsText(fileObj, 'ASCII');
  }
}
