import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr'; // https://github.com/smnbbrv/ngx-plyr

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
})
export class VideoPlayerComponent implements OnInit {
  @Input() file: any;
  @ViewChild(PlyrComponent)
  plyr: PlyrComponent;
  player: Plyr;
  videoSources: Plyr.Source[] = [];

  ngOnInit(): void {
    this.videoSources = [
      {
        src: URL.createObjectURL(this.file),
        type: this.file.type,
      },
    ];
  }

  videoTimeUpdate(event: Plyr.PlyrEvent) {
    console.log('Video player: currentTime', this.player.currentTime);
  }
}
