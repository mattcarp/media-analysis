import { AfterViewInit, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.minimap.js';

import { DdpService, DdpFileService } from '../store/services';
import { DdpState } from '../store/reducers/ddp.reducer';
import {
  selectAudioEntries,
  selectPlayerAnnotation, selectValidation
} from '../store/selectors/ddp.selectors';
import { PlayerAnnotationState, ValidationState } from '../store/models';

declare const Resumable: any;

@Component({
  selector: 'app-ddp-files',
  templateUrl: './ddp.component.html',
  styleUrls: ['./ddp.component.scss']
})
export class DdpComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() files: any;
  waveSurfer: any;
  showWaveform = false;
  resumable: any;
  showError = false;
  showPlay = true;
  fileCounter = 0;
  wavProgress: number;
  audioEntries: any;
  audioFileMap = [];
  playList = [];
  timecode: string;
  playbackStatus: string;
  queuedPreGap: number;
  playerAnnotation: PlayerAnnotationState;
  trackSelected = false;
  currentIndex: number;
  isShowBlock = false;
  validations: ValidationState;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private ddpService: DdpService,
    private ddpFileService: DdpFileService,
    private zone: NgZone,
    private store: Store<DdpState>,
    private logger: NGXLogger
  ) {
  }

  ngOnInit(): void {
    this.store.pipe(select(selectPlayerAnnotation), takeUntil(this.destroy$))
      .subscribe((state: PlayerAnnotationState) => this.playerAnnotation = state);

    this.store.pipe(select(selectValidation), takeUntil(this.destroy$))
      .subscribe((validations: ValidationState) => {
        this.validations = validations;
      });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initPlayer());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initPlayer(): void {
    this.waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#777',
      progressColor: '#90EE90',
      height: 100,
      cursorColor: '#fff',
      cursorWidth: 2,
      plugins: [
        MinimapPlugin.create({
          height: 30,
          waveColor: '#676767',
          progressColor: '#579157',
          cursorColor: '#fff',
        }),
        TimelinePlugin.create({
          container: '#waveform-timeline',
          primaryColor: '#fff',
          primaryFontColor: '#fff',
          secondaryColor: '#c0c0c0',
          secondaryFontColor: '#c0c0c0',
        })
      ]
    });

    this.waveSurfer.on('loading', (progress: number) => {
      this.showWaveform = false;
      this.wavProgress = progress;
    });

    this.waveSurfer.on('audioprocess', () => {
      this.logger.log('current time in audio process?', this.waveSurfer.getCurrentTime());
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
      // this.logger.log('current time?', this.waveSurfer.getCurrentTime());
      this.timecode = this.ddpService.framesToTime(0);
    });

    this.store.pipe(
      select(selectAudioEntries),
      filter((audioEntries: any[]) => !!audioEntries.length),
      takeUntil(this.destroy$)
    ).subscribe((audioEntries: any[]) => {
      this.audioEntries = audioEntries;
      for (let i = 0; i < this.files.length; i += 1) {
        for (let j = 0; j < this.audioEntries.length; j += 1) {
          const fileName = this.files[i].name.toLowerCase();
          const audioFileName = this.audioEntries[j].dsi.trim().toLowerCase();

          if (fileName === audioFileName) {
            this.audioFileMap.push({
              resumableFilesIndex: i,
              playListIndex: j,
              file: this.files[i],
              isrc: this.audioEntries[j].isrc,
              trk: this.audioEntries[j].idx,
              preGap: this.audioEntries[j].preGap,
              dur: this.audioEntries[j].dur
            });
          }
        }
      }

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
      this.ddpFileService.readAudioFile(this.playList[0].file);
    });

    // placeholders - we're not uploading anything yet
    this.resumable = new Resumable();

    this.fileCounter += 1;
    if (this.fileCounter >= this.resumable.files.length) {
      // all files have been added to the resumable files array
      this.ddpFileService.handleFiles(this.waveSurfer, this.files);
      this.fileCounter = 0;
    }
  }

  isSelected(index: number): boolean {
    if (!index || !this.currentIndex) {
      return false;
    }
    return index === this.currentIndex;
  }

  queueTrack(index: number, event: Event): void {
    this.showPlay = true;
    this.currentIndex = index;
    this.trackSelected = true;
    this.logger.log('the click event:', event);
    this.playbackStatus = '';
    this.waveSurfer.empty();
    this.queuedPreGap = this.playList[index].preGap;
    this.logger.log('playlist', this.playList);
    this.logger.log('queued preGap?', this.queuedPreGap);
    this.ddpFileService.readAudioFile(this.playList[index].file);
    const preGapSecs = this.playList[index].preGap / 75.0;
    this.ddpFileService.addRegion(0, preGapSecs);
  }

  playFrom(start: number): void {
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
  togglePlay(): void {
    this.showPlay = !this.showPlay;
    this.waveSurfer.playPause();
  }

  toggleBlock(): void {
    this.isShowBlock = !this.isShowBlock;
  }

  getResultValidation(): string {
    return this.validations.isValid === null
      ? 'question'
      : this.validations.isValid ? 'success' : 'error';
  }
}
