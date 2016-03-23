///<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {Component, Pipe, PipeTransform} from "angular2/core";
import {bootstrap} from "angular2/platform/browser";
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from "angular2/router";

import {HandleFilesComponent} from "./handle-files/handle-files.component";
import {DetectBlackComponent} from "./detect-black/detect-black.component";
import {ExtractMetadataComponent} from "./extract-metadata/extract-metadata.component";
import {AnalyzeAudioComponent} from "./analyze-audio/analyze-audio.component";
import {ValidateFormatComponent} from "./validate-format/validate-format.component";
import {PlayerComponent} from "./player/player.component";
import {UploadFileComponent} from "./upload-file/upload-file.component";

import {DetectBlackService} from "./detect-black/detect-black.service";
import {FileHandlerService} from "./handle-files/handle-files.service";
import {ExtractMetadataService} from "./extract-metadata/extract-metadata.service";
import {QuicktimeService} from "./shared/services/quicktime.service";
import {AnalyzeAudioService} from "./analyze-audio/analyze-audio.service";
import {EndpointService} from "./handle-endpoints/endpoint.service";

@Component({
  selector: "analysis-app",
  templateUrl: "src/main.html",
  directives: [DetectBlackComponent, HandleFilesComponent,
    ExtractMetadataComponent, AnalyzeAudioComponent,
    ValidateFormatComponent, PlayerComponent, UploadFileComponent,
    ROUTER_DIRECTIVES
  ],
  providers: [DetectBlackService, FileHandlerService,
    ExtractMetadataService, AnalyzeAudioService, EndpointService, QuicktimeService]
})
@RouteConfig([
  // { path: "/", name: "root", redirectTo: ["Home"] },
  { path: "/upload", name: "Upload", component: UploadFileComponent },

])
export class AnalysisApp {
  constructor(extractMetadataService: ExtractMetadataService) {
    // TODO subscribe to meta
  }
}


bootstrap(AnalysisApp, [ROUTER_PROVIDERS]);
