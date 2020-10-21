import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import { Store } from '@ngrx/store';

// custom services
import { DdpmsService } from '../ddpms/ddpms.service';
import { DdpidService } from '../ddpid/ddpid.service';
import { DdppqService } from '../ddppq/ddppq.service';
import { DdpService } from './ddp.service';
import { GracenoteService } from '../gracenote/gracenote.service';
import { CdTextService } from '../cdtext/cdtext.service';
import { DdpPqState } from '../reducers/ddppq';
import { DdpMsState, MsEntries } from '../reducers/ddpms';
import { AppState } from '../reducers/index';


@Injectable()
export class DdpFileService {
  parseStartTime: Date;
  waveSurferInstance: any;
  parsedMs: DdpMsState;
  parsedPq: DdpPqState;
  parsedId: Array<Object>;
  audioEntries: Array<Object>;
  // playlist is an array of resumable files
  playList: Array<any>;
  audioSource: any;
  allResumableFiles: Array<any>;
  showWaveform: boolean = false;

  private pqFileReadSource = new Subject<DdpPqState>();
  pqFileRead$ = this.pqFileReadSource.asObservable();

  private allFilesAddedSource = new Subject<Array<Object>>();
  allFilesAdded$ = this.allFilesAddedSource.asObservable();

  private audioEntriesSource = new Subject<Object>();
  audioEntries$ = this.audioEntriesSource.asObservable();

  private annotationSource = new Subject<Object>();
  annotation$ = this.annotationSource.asObservable();

  constructor(private ddpService: DdpService,
              private ddpmsService: DdpmsService,
              private ddpidService: DdpidService,
              private ddppqService: DdppqService,
              private gracenoteService: GracenoteService,
              private cdTextService: CdTextService,
              private store: Store<AppState>) {
  }


  handleFiles(waveSurferInstance: any, resumable: any): void {
    let resumableFiles = resumable.files;
    // TODO do we need this:
    this.allResumableFiles = resumable.files;
    this.parseStartTime = new Date();
    console.log('all files have been added');
    this.store.dispatch({type: 'SET_FILES', payload: {
      selectedAt: new Date(),
      files: resumableFiles
    }
    });
    this.allFilesAddedSource.next(resumableFiles);
    this.waveSurferInstance = waveSurferInstance;
    for (let fileObj of resumableFiles) {
      if (fileObj.fileName.toLowerCase() === 'ddpms') {
        this.readAndParse(fileObj.file, 'ms');
      }
      if (fileObj.fileName.toLowerCase() === 'ddpid') {
        this.readAndParse(fileObj.file, 'id');
      }
    }
  }

  handlePqFile(pqFileInfo: any, resumableFiles: Array<any>) {
    // a pq file can have any name given to it by the ms file
    let fileName: string = pqFileInfo.fileName.trim().toLowerCase();
    for (let fileObj of resumableFiles) {
      if (fileObj.fileName.toLowerCase() === fileName) {
        this.readAndParse(fileObj.file, 'pq');
        // TODO drop this subscription, subscribe to store
        this.pqFileRead$.subscribe(
          (parsedPq: DdpPqState) => {
            this.parsedPq = parsedPq;
            let toc = this.ddpService.createToc(parsedPq.entries);
            this.gracenoteService.queryByToc(toc);
          });
      }
    }
  }

  // TODOmc handle consolidated DDP by reading in track-length portions
  readAudioFile(audioFile: File) {
    const reader = new FileReader();
    let audioBuf: ArrayBuffer = null;

    reader.onload = (e: any) => {
      audioBuf = e.target.result;
      this.queueTrack(audioBuf);
    };
    reader.readAsArrayBuffer(audioFile);
  } // readAudioFile


  queueTrack(audioBuff: ArrayBuffer): void {
    if (!AudioContext) {
      alert('Your browser does not support any AudioContext and cannot play back this audio.');
      return;
    }
    // clear player annotations
    this.annotationSource.next('');
    const audioCtx = new AudioContext();
    let encodedWav = DdpFileService.encodeWav(audioBuff);
    this.audioSource = audioCtx.createBufferSource();
    // convert ArrayBuffer to Blob, in order to draw waveform
    let dataView = new DataView(encodedWav);
    let blob = new Blob([dataView], {type: 'mimeString'});
    this.createWaveForm(blob);
  } // queueTrack

  createWaveForm(waveBuffer: Blob) {
    this.waveSurferInstance.loadBlob(waveBuffer);
  }

  addRegion(start: number, end: number) {
    this.waveSurferInstance.on('ready', () => {
      this.showWaveform = true;
      this.waveSurferInstance.clearRegions();
      this.waveSurferInstance.addRegion({
        drag: false,
        resize: false,
        start: start, // time in seconds
        end: end, // time in seconds
        color: 'hsla(221, 48%, 58%, 0.5)',
        data: 'at some point will use this'
      });
      this.waveSurferInstance.on('region-in', this.showInMsg.bind(this));
      this.waveSurferInstance.on('region-out', this.showOutMsg.bind(this));
    });
  }

  showInMsg(region: any) {
    let msg = {
      start: this.ddpService.framesToTime(region.start * 75),
      end: this.ddpService.framesToTime(region.end * 75),
      type: 'in',
      msg: 'playing from index 0'
    };
    this.annotationSource.next(msg);
  }

  showOutMsg(region: any) {
    let msg = {
      start: this.ddpService.framesToTime(region.end * 75),
      end: 'end of file',
      type: 'in',
      msg: 'playing from index 1'
    };
    this.annotationSource.next(msg);
  }

  static encodeWav(rawAudio: ArrayBuffer): ArrayBuffer {
    // wav header is 44 bytes
    const HEADER_LENGTH = 44;
    let buffer = new ArrayBuffer(HEADER_LENGTH);
    let view = new DataView(buffer);

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
    console.log('the byte length for this Uint32 array , which might not be divisible by 4, is',
      rawAudio.byteLength);
    // view.setUint32(40, rawAudio.byteLength, true);
    /// TODOmc temp hard-coding 32 - should use rawAudio.byteLEngth
    // view.setUint32(40, 32, true);
    view.setFloat32(40, rawAudio.byteLength, true);

    console.log('first 120 chars of view buffer:');
    console.log(String.fromCharCode.apply(null, new Uint8Array(view.buffer.slice(0, 120))));
    return DdpFileService.appendBuffer(view.buffer, rawAudio);
  }

  static writeString(view, offset, text) {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  }

  // concat two ArrayBuffers (e.g. the wav header and audio payload)
  static appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    let tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  } // appendbuffer

  getPqFileInfo(msObj: DdpMsState): Object {
    let pqFileInfo: any = {};
    if (msObj === null) {
      return null;
    }
    let msEntries: MsEntries = msObj.entries;
    for (let i = 0; i < msEntries.length; i++) {
      let currentEntry = msEntries[i];

      if (currentEntry.sub.trim().toUpperCase() === 'PQ DESCR') {
        pqFileInfo.fileName = currentEntry.dsi.trim();
        // parseInt will eliminate leading zeros
        // - always supply radix or you could get octal
        pqFileInfo.fileSize = parseInt(currentEntry.dsl, 10);
        // don't keep going
        return pqFileInfo;
      }
    }
  } // getPqFileInfo

  getCdTextFileInfo(parsedMs) {
    let cdTextFileInfo: any = {};

    if (parsedMs === null || parsedMs === '') {
      return null;
    }

    for (let i = 0; i < parsedMs.length; i++) {
      let currentEntry = parsedMs[i];

      if (currentEntry.sub.trim().toUpperCase() === 'CDTEXT') {
        cdTextFileInfo.fileName = currentEntry.dsi;
        // parseInt will eliminate leading zeros
        // always supply radix or you could get octal
        cdTextFileInfo.fileSize = parseInt(currentEntry.dsl, 10);
        // don't keep going
        return cdTextFileInfo;
      }
    }
  } // getCdTextFileInfo


  // reads small ASCII text files (e.g. DDPMS, DDPID, PQ) and calls parses
  readAndParse(fileObj: File, fileType: string) {
    const textReader: FileReader = new FileReader();
    textReader.onloadend = (e) => {
      switch (fileType) {
        case 'pq':
          // TODO set in store by calling parse, then get from store
          this.ddppqService.parse(textReader.result);
          this.store.select('ddpPq').subscribe((parsedPq: DdpPqState) => {
             console.log('we should have a parsed pq at this point', parsedPq);
            let audioWithPq: Array<any> = this.ddppqService.
            addPqToAudio(this.audioEntries, parsedPq);
            console.log('this is my audio with pq stuff', audioWithPq);
            this.audioEntriesSource.next(audioWithPq);
            // set up the first track for playback
            let trk1Pregap = parseFloat(audioWithPq[0].preGap) / 75.0;
            this.addRegion(0, trk1Pregap);
            // TODO set parsedPq using the store
            this.pqFileReadSource.next(parsedPq);
          });

          break;
        case 'id':
          this.ddpidService.parse(textReader.result, fileObj);
          break;
        case 'ms':
          this.ddpmsService.parse(textReader.result, fileObj);
          this.store.select('ddpMs').subscribe((parsedMs: DdpMsState) => {
            // TODO drop this 'if', use async pipe in container component
            if (parsedMs) {
              // this.hasMs = true;
              // TODO get the parsedMs info from the store, put audio entries in the store
              this.audioEntries = this.ddpmsService.getAudioEntries(parsedMs);
              const pqFileInfo: any = this.getPqFileInfo(parsedMs);
              console.log('parsed ms:', parsedMs);
              this.handlePqFile(pqFileInfo, this.allResumableFiles);
              const cdTextFileInfo = this.getCdTextFileInfo(parsedMs);
              if (cdTextFileInfo) {
                this.cdTextService.getFile(cdTextFileInfo, this.allResumableFiles);
              }
              console.log('audio entries');
              console.dir(this.audioEntries);
            }
          });

          break;
      }
    };
    textReader.readAsText(fileObj, 'ASCII');
  } // readAndParse

}
