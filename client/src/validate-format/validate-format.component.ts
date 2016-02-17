import {Component} from 'angular2/core';

import {ExtractMetadataService} from '../extract-metadata/extract-metadata.service';

declare var $: any;

@Component({
  selector: 'validate-format',
  templateUrl: 'src/validate-format/validate-format.html',
})

export class ValidateFormatComponent {
  metadataStarted: boolean;
  metadataResult: any;
  showMetadata: boolean


  constructor(extractMetadataService: ExtractMetadataService) {
    extractMetadataService.metadataStarted.subscribe(value => {
      this.metadataStarted = value;
    });
    extractMetadataService.metadataResult.subscribe(value => {
      this.metadataResult = value;
      this.validate(this.metadataResult);
    });


  }

  validate(metadata: Object) {
    console.log("hiya from format validation, where you have received this:");
    console.log(metadata);

  }



}
