
///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {Component, Pipe, PipeTransform} from "angular2/core";
// import {Observable} from 'rxjs/Rx';
import {bootstrap} from "angular2/platform/browser";

import {DetectBlackComponent} from './detect-black/detect-black.component';
import {DetectBlackService} from './detect-black/detect-black.service';
import {HandleFilesComponent} from './handle-files/handle-files.component';
import {ExtractMetadataComponent} from './extract-metadata/extract-metadata.component';

import {FileHandlerService} from "./handle-files/handle-files.service";
import {ExtractMetadataService} from "./extract-metadata/extract-metadata.service";
import {DetectMonoService} from "./detect-mono/detect-mono.service";

// initial slice for metadata analysis
const SLICE_SIZE = 150000;
// bit rates from ffmpeg are unreliable, so we have to take a fixed chunk
const BLACK_CHUNK_SIZE = 10000000;
// minimum time, in seconds, for black at head and tail
const MIN_BLACK_TIME = 4;
// allow for jQuery - necessary for its ajax library
declare var $: any;
declare var FileReader: any;

@Component({
  selector: "analysis-app",
  templateUrl: "src/main.html",
  directives: [DetectBlackComponent, HandleFilesComponent,
    ExtractMetadataComponent],
  providers: [DetectBlackService, FileHandlerService,
    ExtractMetadataService, DetectMonoService]
})
export class AnalysisApp {}

bootstrap(AnalysisApp);
