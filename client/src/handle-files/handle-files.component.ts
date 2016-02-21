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
      <div class="dz-preview dz-file-preview ma-file__stats">
        <div class="dz-details">
          <div class="dz-filename"><h5>file name: <span data-dz-name></span></h5></div>
          <h5>size: <span data-dz-size></span></h5>
        </div>
      </div>
      `
    }).on("addedfile", function(file) {
      fileHandlerService.setMediaFile(file);
      extractMetadataService.extract(file);

      extractMetadataService.metadataResult.subscribe(metadata => {
        const analysisObj = JSON.parse(metadata.analysis);
        // temporarily avoid black and mono detect on ProRes
        // if (analysisObj.streams[0].codec_long_name !== "ProRes") {
          detectBlackService.recursiveBlackDetect(file, "head");
          detectBlackService.recursiveBlackDetect(file, "tail");
          // TODO pass bitrate to detectMono as second param
          detectMonoService.detectMono(file);
        // }

      });


    });
  }
} // class
