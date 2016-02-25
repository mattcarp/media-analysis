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
  templateUrl: "src/upload-file/upload-file.html",
  directives: [RouterLink]
})
export class UploadFileComponent {
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

  startUpload() {
    let mediaFile = this.fileHandlerService.getMediaFile();
    this.openRequestedPopup(mediaFile);
  }

  openRequestedPopup(mediaFile: File) {
    let windowObjectReference;
    console.log("you passed this");
    console.log(mediaFile);
    windowObjectReference = window.open(
      "http://blank.org",
      "DescriptiveWindowName",
      "width=420,height=230,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0"
    );

    windowObjectReference.foo = "heeeyyyyy";

    windowObjectReference.theFile = mediaFile;
    // let mediaFile = this.fileHandlerService.getMediaFile();
    // windowObjectReference.locationbar.visible = false;
  }

  toggleUploadButton() {
    this.enableUpload = !this.enableUpload;
  }
}
