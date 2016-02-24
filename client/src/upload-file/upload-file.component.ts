import {Component} from "angular2/core";
import {ExtractMetadataService} from '../extract-metadata/extract-metadata.service';
import {FileHandlerService} from '../handle-files/handle-files.service';
// import {PlayerService} from "./player.service";

declare var jwplayer: any;

// TODOmc inject the player service

@Component({
  selector: "upload-file",
  templateUrl: "src/upload-file/upload-file.html"
})

export class UploadFileComponent {
  showUploadButton: boolean = false;
  enableUpload: boolean = false;
  metadataResult: any;

  constructor(extractMetadataService: ExtractMetadataService,
    fileHandlerService: FileHandlerService) {
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe(value => {
      this.showUploadButton = true;
    });
  }

  startUpload() {
    // alert("this is where we would launch a separate uploader screen");
    this.openRequestedPopup();
  }

  openRequestedPopup() {
    let windowObjectReference;
    windowObjectReference = window.open(
      "http://blank.org",
      "DescriptiveWindowName",
      "width=420,height=230,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0"
    );
    windowObjectReference.locationbar.visible = false;
  }

  toggleUploadButton() {
    this.enableUpload = !this.enableUpload;
  }
}
