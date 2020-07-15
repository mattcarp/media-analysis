import {Component} from "@angular/core";
import {
  Router,
  RouterLink,
} from "@angular/router";

import {ExtractMetadataService} from "../extract-metadata/extract-metadata.service";
import {FileHandlerService} from "../handle-files/handle-files.service";


@Component({
  selector: "upload-file",
  templateUrl: "./uploader.html",
  // directives: [RouterLink]
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
