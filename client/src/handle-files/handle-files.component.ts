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
  filename: string;
  fileSize: string;

  constructor(eltRef: ElementRef, fileHandlerService: FileHandlerService,
    extractMetadataService: ExtractMetadataService,
    detectBlackService: DetectBlackService,
    detectMonoService: DetectMonoService) {

    let myDropzone = new Dropzone(eltRef.nativeElement, {
      url: "/file/post",
      previewTemplate: `
      <div class="dz-preview dz-file-preview ma-file__dz--hidden">
        <div class="dz-details">
          <div class="dz-filename"><h5>file name: <span data-dz-name></span></h5></div>
          <h5>size: <span data-dz-size></span></h5>
        </div>
      </div>
      `
    }).on("addedfile", (file) => {
      console.log("da file:");
      console.log(file);
      this.filename = file.name;
      this.fileSize = this.bytesToSize(file.size);
      fileHandlerService.setMediaFile(file);
      extractMetadataService.extract(file);

      extractMetadataService.metadataResult.subscribe(metadata => {
        const analysisObj = JSON.parse(metadata.analysis);
        // temporarily avoid black and mono detect on ProRes
        // if (analysisObj.streams[0].codec_long_name !== "ProRes") {
          detectBlackService.recursiveBlackDetect(file, "head");
          detectBlackService.recursiveBlackDetect(file, "tail");
          // TODO pass bitrate from to detectMono as second param
          detectMonoService.detectMono(file);

      });
    });
  }

  bytesToSize(bytes: number) {
   let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   let i = Math.floor(Math.log(bytes) / Math.log(1024));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 };
} // class
