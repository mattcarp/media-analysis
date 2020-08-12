import { Component } from '@angular/core';
import {
  Router,
  // RouterLink,
} from '@angular/router';

import { ExtractMetadataService } from '../extract-metadata/extract-metadata.service';
import { FileHandlerService } from '../handle-files/handle-files.service';


@Component({
  selector: 'upload-file',
  templateUrl: './upload-file.component.html',
  // directives: [RouterLink]
})
export class UploadFileComponent {
  showUploadButton = false;
  enableUpload = false;
  metadataResult: any;
  fileHandlerService: any;

  constructor(private _router: Router, extractMetadataService: ExtractMetadataService,
              fileHandlerService: FileHandlerService) {
    this.fileHandlerService = fileHandlerService;
    this.metadataResult = extractMetadataService.metadataResult;
    this.metadataResult.subscribe(value => {
      this.showUploadButton = true;
    });
  }

  startUpload() {
    const mediaFile = this.fileHandlerService.getMediaFile();
    this.openRequestedPopup(mediaFile);
  }

  openRequestedPopup(mediaFile: File) {
    console.log('open popup: you requested this file:');
    let windowObjectReference;
    console.log(mediaFile);
    windowObjectReference = window.open(
      'http://blank.org',
      'DescriptiveWindowName',
      'width=420,height=230,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0',
    );
    // windowObjectReference = window.open(
    //   this._router.navigate(['']),
    //   'DescriptiveWindowName',
    //   'width=420,height=230,resizable,scrollbars=yes,status=0,toolbar=0,menubar=0,location=0'
    // );

    windowObjectReference.foo = 'heeeyyyyy';

    windowObjectReference.theFile = mediaFile;
    // let mediaFile = this.fileHandlerService.getMediaFile();
    windowObjectReference.locationbar.visible = false;
  }

  toggleUploadButton() {
    this.enableUpload = !this.enableUpload;
  }
}
