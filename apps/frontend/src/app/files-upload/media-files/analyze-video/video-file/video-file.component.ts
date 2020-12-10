import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-analyze-video',
  templateUrl: './video-file.component.html',
})
export class VideoFileComponent {
  @Input() file: any;
}
