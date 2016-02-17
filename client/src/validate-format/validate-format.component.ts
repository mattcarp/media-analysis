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
  showResults: boolean;
  audioValidations: Object[] = [];
  results: Object[] = [];


  constructor(extractMetadataService: ExtractMetadataService) {
    extractMetadataService.metadataStarted.subscribe(value => {
      this.metadataStarted = value;
    });
    extractMetadataService.metadataResult.subscribe(value => {
      this.metadataStarted = false;
      this.validate(value);
    });

  }

  validate(metadata: any) {
    const analysisObj = JSON.parse(metadata.analysis);;
    console.log("hiya from format validation, where you have received this:");
    console.log(analysisObj);
    this.results.push("boo");
    this.audioValidations.push({
      name: "my name",
      value: "my value"
    })
    console.log("my results:")
    console.log(this.results);
    this.showResults = true;

  }



}
