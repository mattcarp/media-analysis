import { Injectable } from '@angular/core';

import { File } from '../models/file.model';
import { HelperService } from '../services/helper.service';

@Injectable({ providedIn: 'root' })
export class UploaderService {
  files: File[] = [];
  sortField = '';
  errorAnalysis: string[] = [];
  successAnalysis: string[] = [];

  constructor(private helperService: HelperService) {}

  setMediaFile(mediaFile: any): void {
    this.files = mediaFile;
  }

  addFile(files: File[]): any {
    const newFiles: File[] = [];

    files.forEach((file: any) => {
      newFiles.push(file);
    });

    this.files.concat(newFiles);

    return newFiles;
  }

  removeFile(fileId: string): any {
    console.log('removeFile', fileId);
  }

  getFile(id: string): File {
    return this.files.find((file) => file.id === id);
  }

  clear(): void {
    this.files = [];
  }

  checkAnalysis(): void {
    const newFiles: File[] = [];

    this.files.forEach((file: File) => {
      if (this.successAnalysis.includes(file.id)) {
        // return (file.analysed = 'success');
        newFiles.push(file);
      }
      if (this.errorAnalysis.includes(file.id)) {
        // return (file.analysed = 'error');
      }
      // return (file.analysed = 'null');
    });
  }
}
