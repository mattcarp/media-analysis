import {Component, ElementRef} from "angular2/core";

import {FileHandlerService} from "./handle-files.service";

declare var $: any;
declare var Dropzone: any;

@Component({
  selector: 'handle-files',
  // templateUrl: 'src/handle-files/handle-files.html',
  template: `
  <div id="demo-upload" class="dropzone needsclick dz-clickable">
    <!-- <form action="/upload" class="dropzone needsclick dz-clickable" id="demo-upload"> -->

      <div class="dz-message needsclick">
        drop a media file here or click to upload....
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
  constructor(eltRef: ElementRef, fileHanderService: FileHandlerService) {

    let myDropzone = new Dropzone(eltRef.nativeElement, {
      url: "/file/post"
    }).on("addedfile", function(file) {
      fileHanderService.setMediaFile(file);
      // TODO kick off metadata analysis
      console.log("you should fire off getMetadata here, but it will need to be in a service, asshole");
      console.log("so, move it from main.ts into a service, then you can call it from here - which is the constructor on HandleFilesComponent");
    });
  }
}
