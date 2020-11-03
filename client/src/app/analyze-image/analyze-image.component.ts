import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

declare let EXIF: any;

@Component({
  selector: 'analyze-image',
  templateUrl: './analyze-image.component.html',
})
export class AnalyzeImageComponent implements AfterViewInit {
  @Input() metadata: any;
  @Output() validateResult?: EventEmitter<string> = new EventEmitter();
  output: string;
  imageSrc: string | ArrayBuffer;
  imageValidations: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getExif();
    }, 500);

    let result = 'null'; // TODO 'pass'
    this.imageValidations.forEach((item) => {
      if (!item.pass) {
        result = 'error';
      }
    });

    this.validateResult.emit(result);
  }

  private getExif() {
    const img = new Image();
    let text: string;

    img.src = this.metadata.preview;
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let allMetaData: any;
      EXIF.getData(img, function () {
        // `this` is provided image, check with `console.log(this)`
        allMetaData = EXIF.getAllTags(this);
        text = JSON.stringify(allMetaData, null, '  ');
        text = text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:([^/])/g, '$2:$4');
      });

      this.output = text;
      this.cdr.detectChanges();
    };
  }
}
