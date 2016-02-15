import {Component, ElementRef} from "angular2/core";

import {FileHandlerService} from "./handle-files.service";
import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";

declare var $: any;
declare var Dropzone: any;

@Component({
  selector: 'handle-files',
  // templateUrl: 'src/handle-files/handle-files.html',
  template: `
  <div id="demo-upload" class="dropzone needsclick dz-clickable">
    <!-- <form action="/upload" class="dropzone needsclick dz-clickable" id="demo-upload"> -->

      <div class="dz-message needsclick">
        drop a media file here or <strong>click to upload....</strong>
        <br>
        <span class="note needsclick">Your media file will be checked for compatibility</span>
      </div>

    <!-- </form> -->
  </div>
  `,
  /*,
  encapsulation: ViewEncapsulation.NONE*/
})

export class HandleFilesComponent {
  constructor(eltRef: ElementRef, fileHanderService: FileHandlerService,
    extractMetadataService: ExtractMetadataService) {

    let myDropzone = new Dropzone(eltRef.nativeElement, {
      url: "/file/post"
    }).on("addedfile", function(file) {
      fileHanderService.setMediaFile(file);
      extractMetadataService.extract(file);
    });
  }
}
