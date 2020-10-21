import { AfterViewInit, ChangeDetectorRef, Component, Input } from '@angular/core';

declare let EXIF: any;

@Component({
  selector: 'analyze-image',
  templateUrl: './analyze-image.component.html',
})
export class AnalyzeImageComponent implements AfterViewInit {
  @Input() imgData: any;
  output: string;
  public imageSrc: string | ArrayBuffer;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getExif();
    }, 500);
  }

  private getExif() {
    const img = new Image();
    let text: string;

    img.src = this.imgData.preview;
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
