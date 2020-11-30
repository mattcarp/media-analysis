import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
})
export class VideoPlayerComponent implements AfterViewInit {
  @Input() file: any;
  @ViewChild('addVideoPlayer') addVideoPlayer: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.createVideoTag();
  }

  createVideoTag() {
    const videoElement = this.renderer.createElement('video');
    const sourceElement = this.renderer.createElement('source');

    videoElement.setAttribute('controls', String(true));
    videoElement.setAttribute('width', '100%');
    sourceElement.setAttribute('src', URL.createObjectURL(this.file));
    sourceElement.setAttribute('type', this.file.type);

    this.renderer.appendChild(videoElement, sourceElement);
    this.renderer.appendChild(this.addVideoPlayer.nativeElement, videoElement);
  }
}
