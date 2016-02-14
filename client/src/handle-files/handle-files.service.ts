import {Injectable} from 'angular2/core';

@Injectable()
export class FileHandlerService {
  mediaFile: File;

  setMediaFile(mediaFile: File) {
    this.mediaFile = mediaFile;
    console.log("you set the file:", mediaFile);
  }

  getMediaFile() {
    return this.mediaFile;
  }

}
