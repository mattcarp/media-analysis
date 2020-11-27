import { Component, EventEmitter, Input, Output } from '@angular/core';

import { File } from '../models/file.model';
import { ImageRulesConstants } from './image-rules.constants';

declare let EXIF: any;

@Component({
  selector: 'app-analyze-image',
  templateUrl: './analyze-image.component.html',
})
export class AnalyzeImageComponent {
  @Input() file: File;
  @Output() validateResult?: EventEmitter<string> = new EventEmitter();
  metadataStarted: boolean;
  showResults: boolean;
  proResMsg: string;
  output: string;
  imageSrc: string | ArrayBuffer;
  imageValidations: any[] = [];
  imageRules = ImageRulesConstants.imageStream[0];
  showExif = false;

  ngOnInit(): void {
    this.getExif(this.file);
  }

  validate(data: { analysis; error }): void {
    this.imageValidations = [];

    const analysisObj = JSON.parse(data.analysis);
    const streams: any = analysisObj.streams;
    let videoStream: any;

    if (streams && streams.length) {
      for (let i = 0; i < streams.length; i += 1) {
        if (streams[i].codec_type === 'video') {
          videoStream = streams[i];
        }
      }
    }

    if (videoStream) {
      this.imageValidations.push({
        name: 'Codec',
        value: videoStream.codec_long_name,
        success: this.imageRules.codecs.indexOf(videoStream.codec_name) > -1,
        message: this.imageRules.codecsMessage,
      });
    }

    let result = 'success';
    this.imageValidations.forEach((item) => {
      if (!item.success) {
        result = 'error';
      }
    });

    this.validateResult.emit(result);
    this.showResults = true;
  }

  toggleExif(): void {
    this.showExif = !this.showExif;
  }

  private getExif(file) {
    const img = new Image();
    let text: string;

    img.src = file.preview;
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let allMetaData: any;
      EXIF.getData(img, function () {
        // `this` is provided image, check with `this.logger.log(this)`
        allMetaData = EXIF.getAllTags(this);
        text = JSON.stringify(allMetaData, null, '  ');
        text = text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:([^/])/g, '$2:$4');
      });

      this.output = text;
    };
  }
}
