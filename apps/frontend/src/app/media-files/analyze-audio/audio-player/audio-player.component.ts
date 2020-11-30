import { AfterViewInit, Component, Input, NgZone } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import WaveSurfer from 'wavesurfer.js';

import { AudioService } from '../../store/services';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements AfterViewInit {
  @Input() file: any;
  waveSurfer: any;
  showPlay = true;
  timeCode: string;

  constructor(
    private audioService: AudioService,
    private zone: NgZone,
    private logger: NGXLogger)
  {}

  ngAfterViewInit(): void {
    this.initPlayer();
  }

  initPlayer(): void {
    this.waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#ECE4F4',
      progressColor: '#A96FE8',
      height: 100,
      cursorColor: '#A96FE8',
      cursorWidth: 2,
    });

    this.waveSurfer.on('audioprocess', () => {
      this.logger.log('current time in audio process?', this.waveSurfer.getCurrentTime());
      const timeInSecs: number = this.waveSurfer.getCurrentTime();
      this.zone.run(() => {
        this.timeCode = this.audioService.framesToTime(Math.floor(timeInSecs * 75));
      });
    });

    this.waveSurfer.on('seek', () => {
      const timeInSecs: number = this.waveSurfer.getCurrentTime();
      this.zone.run(() => {
        this.timeCode = this.audioService.framesToTime(Math.round(timeInSecs * 75));
      });
    });

    this.waveSurfer.on('ready', () => {
      this.timeCode = this.audioService.framesToTime(0);
    });

    this.waveSurfer.load(URL.createObjectURL(this.file));
  }

  togglePlay(): void {
    this.showPlay = !this.showPlay;
    this.waveSurfer.playPause();
  }
}
