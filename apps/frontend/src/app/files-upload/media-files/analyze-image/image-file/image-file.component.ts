import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-analyze-image',
  templateUrl: './image-file.component.html',
})
export class ImageFileComponent {
  @Input() file: any;
}
