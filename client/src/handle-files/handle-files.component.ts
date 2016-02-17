import {Component, ElementRef} from "angular2/core";

import {FileHandlerService} from "./handle-files.service";
import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";
import {DetectBlackService} from "../detect-black/detect-black.service";
import {DetectMonoService} from "../detect-mono/detect-mono.service";

declare var $: any;
declare var Dropzone: any;

@Component({
  selector: "handle-files",
  templateUrl: "src/handle-files/handle-files.html"
})

export class HandleFilesComponent {
  constructor(eltRef: ElementRef, fileHandlerService: FileHandlerService,
    extractMetadataService: ExtractMetadataService,
    detectBlackService: DetectBlackService,
    detectMonoService: DetectMonoService) {

    let myDropzone = new Dropzone(eltRef.nativeElement, {
      url: "/file/post",
      previewTemplate: `
      <div class="dz-preview dz-file-preview">
        <div class="dz-details">
          <div class="dz-filename">file name: <span data-dz-name></span></div>
          size: <div class="dz-size" data-dz-size></div>
        </div>
      </div>
      `
    }).on("addedfile", function(file) {
      // TODO would be better to fire all analysis from a central service,
      // which in turn subscribes to changes on the mediaFile object
      fileHandlerService.setMediaFile(file);
      extractMetadataService.extract(file);
      detectBlackService.recursiveBlackDetect(file, "head");
      detectBlackService.recursiveBlackDetect(file, "tail");
      // TODO pass bitrate to detectMono as second param
      detectMonoService.detectMono(file);
    });
  }
} // class
