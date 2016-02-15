import {Component, ElementRef} from "angular2/core";

import {ValidationsService} from "./validations.service";

declare var $: any;
declare var Dropzone: any;

@Component({
  selector: "handle-files",
  templateUrl: "src/handle-files/handle-files.html"
})

export class ValidationsComponent {
  validationStartedEmitter: any;
  constructor(
    validationsService: ValidationsService) {
  }
} // class
