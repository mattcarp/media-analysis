import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-analyze-audio',
  templateUrl: './audio-file.component.html',
})
export class AudioFileComponent {
  @Input() file: any;
}
