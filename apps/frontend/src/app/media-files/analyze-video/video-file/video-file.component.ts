import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-analyze-video',
  templateUrl: './video-file.component.html',
})
export class VideoFileComponent {
  @Input() file: any;
  @Output() validateResult?: EventEmitter<string> = new EventEmitter();
  resultValidation: string = 'question' || 'success' || 'error';

  getResultValidation(): string {
    return this.resultValidation;
  }

  handleResultValidation(state: string) {
    this.resultValidation = state;
  }
}
