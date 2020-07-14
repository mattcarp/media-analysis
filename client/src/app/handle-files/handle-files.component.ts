import { AfterViewInit, Component, ElementRef } from '@angular/core';

import {FileHandlerService} from "./handle-files.service";
import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";
import {DetectBlackService} from "../detect-black/detect-black.service";
import {AnalyzeAudioService} from "../analyze-audio/analyze-audio.service";
// import './dropzone.min.js';

declare var $: any;
declare var Dropzone: any;


@Component({
  selector: "handle-files",
  templateUrl: "./handle-files.html"
})

export class HandleFilesComponent implements AfterViewInit {
  filename: string;
  fileSize: string;
  files: File[] = [];

  constructor(private eltRef: ElementRef,
              private fileHandlerService: FileHandlerService,
              private extractMetadataService: ExtractMetadataService,
              private detectBlackService: DetectBlackService,
              private detectMonoService: AnalyzeAudioService) {
  }

  ngAfterViewInit() {

    // new Dropzone(this.eltRef.nativeElement, {
    //     url: "/file/post",
    //     previewTemplate: `
    //     <div class="dz-preview dz-file-preview ma-file__dz--hidden">
    //       <div class="dz-details">
    //         <div class="dz-filename"><h5>file name: <span data-dz-name></span></h5></div>
    //         <h5>size: <span data-dz-size></span></h5>
    //       </div>
    //     </div>
    //     `
    //   }).on("addedfile", (file) => {
    //     this.filename = file.name;
    //     this.fileSize = this.bytesToSize(file.size);
    //     this.fileHandlerService.setMediaFile(file);
    //     this.extractMetadataService.extract(file);
    //
    //     this.extractMetadataService.metadataResult.subscribe(metadata => {
    //       // const analysisObj = JSON.parse(metadata.analysis);
    //       // TODO only if video, detect black and detect mono
    //       this.detectBlackService.recursiveBlackDetect(file, "head");
    //       this.detectBlackService.recursiveBlackDetect(file, "tail");
    //
    //         // attempt to clear previous state - TODO not working
    //         // detectMonoService.results = [];
    //         // detectMonoService.signalAnalysis = [];
    //         // TODO pass bitrate from analysisObj to detectMono as second param
    //       this.detectMonoService.detectMono(file);
    //     });
    //   });
  }

  onSelect(event) {
    console.log(event);
    this.files.push(...event.addedFiles);
    const file = event.addedFiles[0];
    this.fileHandlerService.setMediaFile(file);
    this.extractMetadataService.extract(file);
    this.filename = file.name;
    this.fileSize = this.bytesToSize(file.size);

    this.extractMetadataService.metadataResult.subscribe(metadata => {
      // const analysisObj = JSON.parse(metadata.analysis);
      // TODO only if video, detect black and detect mono
      this.detectBlackService.recursiveBlackDetect(file, "head");
      this.detectBlackService.recursiveBlackDetect(file, "tail");

      // attempt to clear previous state - TODO not working
      // detectMonoService.results = [];
      // detectMonoService.signalAnalysis = [];
      // TODO pass bitrate from analysisObj to detectMono as second param
      this.detectMonoService.detectMono(file);
    });
  }

  onRemove(event) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
  }

  bytesToSize(bytes: number) {
   let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
   if (bytes === 0) return "0 Byte";
   let i = Math.floor(Math.log(bytes) / Math.log(1024));
   // return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
   return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
 };
} // class
