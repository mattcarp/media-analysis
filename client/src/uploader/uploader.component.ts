import {Component} from "angular2/core";
import {
  Router,
  RouterLink,
  RouteParams,
} from "angular2/router";

import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";
import {FileHandlerService} from "../handle-files/handle-files.service";


@Component({
  selector: "upload-file",
  templateUrl: "./uploader.html",
  directives: [RouterLink]
})
export class UploaderComponent {
  showUploadButton: boolean = false;
  enableUpload: boolean = false;
  metadataResult: any;
  fileHandlerService: any;

  constructor(extractMetadataService: ExtractMetadataService,
    fileHandlerService: FileHandlerService) {
    this.fileHandlerService = fileHandlerService;
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe(value => {
      this.showUploadButton = true;
    });
  }

}
