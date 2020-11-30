import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-analyze-image',
  templateUrl: './image-file.component.html',
})
export class ImageFileComponent {
  @Input() file: any;
  @Output() validateResult?: EventEmitter<string> = new EventEmitter();
  isExif = true;
  resultValidation: string = 'question' || 'success' || 'error';

  handleFileExif(exif: string) {
    this.isExif = !!exif.length;
  }

  getResultValidation(): string {
    return this.resultValidation;
  }

  handleResultValidation(state: string) {
    this.resultValidation = state;
  }
}
