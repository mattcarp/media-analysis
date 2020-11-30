import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { FileEntry } from '../../store/models';

declare let EXIF: any;

@Component({
  selector: 'app-image-exif',
  templateUrl: './image-exif.component.html',
})
export class ImageExifComponent implements OnInit {
  @Input() file: FileEntry;
  @Output() outputEmit?: EventEmitter<string> = new EventEmitter();
  output: string;

  ngOnInit(): void {
    setTimeout(() => {
      this.getExif(this.file);
    }, 100);
  }

  private getExif(file) {
    const img = new Image();
    let text: string;

    img.src = file.preview;
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let allMetaData: any;
      EXIF.getData(img, function () {
        // `this` is provided image, check with `console.log(this)`
        allMetaData = EXIF.getAllTags(this);
        text = JSON.stringify(allMetaData, null, '  ');
        text = text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:([^/])/g, '$2:$4');
      });

      this.output = text.substring(1,text.length-1);
      this.outputEmit.emit(this.output);
    };
  }
}
