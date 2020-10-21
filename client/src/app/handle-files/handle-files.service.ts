import { Injectable } from '@angular/core';

import { LoggerService } from '../services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class FileHandlerService {
  mediaFile: File;

  constructor(private loggerService: LoggerService) {}

  setMediaFile(mediaFile: File): void {
    this.mediaFile = mediaFile;

    this.loggerService.info(
      `Added file: ${mediaFile.name}, \t type: ${mediaFile.type}, \t size: ${mediaFile.size}`,
      'color: green',
    );
  }

  getMediaFile(): any {
    return this.mediaFile;
  }
}
