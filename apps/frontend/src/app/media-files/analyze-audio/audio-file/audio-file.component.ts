import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-analyze-audio',
  templateUrl: './audio-file.component.html',
})
export class AudioFileComponent {
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
