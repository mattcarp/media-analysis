import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.js';

import { DdpService, DdpFileService } from '../store/services';

declare const Resumable: any;

@Component({
  selector: 'app-ddp',
  templateUrl: './ddp.component.html',
  styleUrls: ['./ddp.component.scss'],
})
export class DdpComponent implements OnInit, AfterViewInit {
  @ViewChild('dropArea') dropArea: ElementRef;
  @ViewChild('browseArea') browseArea: ElementRef;
  @ViewChild('slider') slider: ElementRef;
  waveSurfer: any;
  showWaveform = false;
  resumable: any;
  showError = false;
  showPlay = true;
  fileCounter = 0;
  wavProgress: number;
  audioEntries: any;
  allResumableFiles: any;
  // maps the audio track number to the index in the allResumableFiles array
  audioFileMap = [];
  playList = [];
  timecode: string;
  playbackStatus: string;
  showDragDrop = true;
  showTabs = false;
  queuedPreGap: number;
  playerAnnotation: any;
  trackSelected = false;
  currentIndex: number;

  constructor(
    private ddpService: DdpService,
    private ddpFileService: DdpFileService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.ddpFileService.annotation$.subscribe((msg: any) => {
      this.playerAnnotation = msg;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initPlayer());
  }

  initPlayer(): void {
    this.waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#ECE4F4',
      progressColor: '#A96FE8',
      height: 100,
      cursorColor: '#A96FE8',
      cursorWidth: 2,
      minimap: true,
      plugins: [
        MinimapPlugin.create({
          height: 30,
          waveColor: '#ddd',
          progressColor: '#999',
          cursorColor: '#999',
        }),
      ],
    });

    this.waveSurfer.on('loading', (progress: number, target: any) => {
      this.showWaveform = false;
      this.wavProgress = progress;
    });

    this.waveSurfer.on('audioprocess', () => {
      // console.log('current time in audio process?', this.waveSurfer.getCurrentTime());
      const timeInSecs: number = this.waveSurfer.getCurrentTime();
      this.zone.run(() => {
        // TODOmc errors due to rounding
        this.timecode = this.ddpService.framesToTime(Math.floor(timeInSecs * 75));
      });
    });

    this.waveSurfer.on('seek', () => {
      const timeInSecs: number = this.waveSurfer.getCurrentTime();
      this.zone.run(() => {
        this.timecode = this.ddpService.framesToTime(Math.round(timeInSecs * 75));
      });
    });

    this.waveSurfer.on('finish', () => {
      this.zone.run(() => {
        this.playbackStatus = 'playback completed';
      });
    });

    this.waveSurfer.on('ready', () => {
      this.showWaveform = true;
      // console.log('current time?', this.waveSurfer.getCurrentTime());
      this.timecode = this.ddpService.framesToTime(0);
      const timeline = Object.create(WaveSurfer.Timeline);
      timeline.init({
        wavesurfer: this.waveSurfer,
        container: '#waveform-timeline',
      });
    });

    this.ddpFileService.audioEntries$.subscribe((audioEntries) => {
      this.audioEntries = audioEntries;
      for (let i = 0; i < this.allResumableFiles.length; i++) {
        for (let j = 0; j < this.audioEntries.length; j++) {
          if (this.allResumableFiles[i].fileName.toLowerCase() ===
            this.audioEntries[j].dsi.trim().toLowerCase()) {
            this.audioFileMap.push({
              resumableFilesIndex: i,
              playListIndex: j,
              file: this.allResumableFiles[i],
              isrc: this.audioEntries[j].isrc,
              trk: this.audioEntries[j].idx,
              preGap: this.audioEntries[j].preGap,
              dur: this.audioEntries[j].dur,
            });
          }
        } // inner loop
      } // outer loop

      // sort by index
      this.audioFileMap.sort((a, b) => {
        if (a.playListIndex > b.playListIndex) {
          return 1;
        }
        if (a.playListIndex < b.playListIndex) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
      this.playList = this.audioFileMap;
      // queue up the first track
      this.ddpFileService.readAudioFile(this.playList[0].file.file);
    });

    // placeholders - we're not uploading anything yet
    this.resumable = new Resumable({
      target: 'http://localhost:8081/java-example/upload',
      chunkSize: 1024 * 1024,
      simultaneousUploads: 4,
      testChunks: true,
      throttleProgressCallbacks: 1,
      method: 'octet',
      maxChunkRetries: 10,
    });

    if (!this.resumable.support) {
      this.showError = true;
    }

    if (this.resumable.support) {
      this.showError = false;
      this.resumable.assignDrop(this.dropArea.nativeElement);
      this.resumable.assignBrowse(this.browseArea.nativeElement);

      // handle file add event
      this.resumable.on('fileAdded', (resumableFile: any) => {
        this.fileCounter++;
        if (this.fileCounter >= this.resumable.files.length) {
          // all files have been added to the resumable files array
          // TODOmc this is a good place to check if we have a consolidated
          this.showDragDrop = false;
          this.showTabs = true;
          this.allResumableFiles = this.resumable.files;
          this.ddpFileService.handleFiles(this.waveSurfer, this.resumable);
          this.fileCounter = 0;
        }
      });
    }
  }

  onSliderChange(value): void {
    // console.log('were does the waveform disappear?', slider.value);
    this.waveSurfer.zoom(Number(value));
  }

  isSelected(index: number): boolean {
    if (!index || !this.currentIndex) {
      return false;
    }
    return index === this.currentIndex;
  }

  queueTrack(index: number, event: Event): void {
    // TODO highlight selected track
    this.currentIndex = index;
    this.trackSelected = true;
    console.log('the click event:', event);
    this.playbackStatus = '';
    this.waveSurfer.empty();
    this.queuedPreGap = this.playList[index].preGap;
    console.log('playlist', this.playList);
    console.log('queued preGap?', this.queuedPreGap);
    this.ddpFileService.readAudioFile(this.playList[index].file.file);
    const preGapSecs = this.playList[index].preGap / 75.0;
    this.ddpFileService.addRegion(0, preGapSecs);
    // this.ddpFileService.addRegion(preGapSecs, preGapSecs);
  }

  playFrom(start: number, end?: number): void {
    this.playbackStatus = '';
    this.showPlay = !this.showPlay;
    this.waveSurfer.play(start);
  }

  playFromIdx1(): void {
    this.playbackStatus = '';
    // set preGap if we are on initial track
    if (!this.queuedPreGap) {
      this.queuedPreGap = this.playList[0].preGap;
    }
    this.showPlay = !this.showPlay;
    this.waveSurfer.play(this.queuedPreGap / 75.0);
  }

  // toggle between play and pause
  playPause(): void {
    this.showPlay = !this.showPlay;
    this.waveSurfer.playPause();
  }
}
