import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { UploaderService } from './uploader.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements AfterViewInit {
  @Output() addedFiles?: EventEmitter<any[]> = new EventEmitter();
  fileID: string;
  successAnalysisIds: string[] = [];
  errorAnalysisIds: string[] = [];

  constructor(
    private uploaderService: UploaderService,
    private store: Store<any>,
  ) {}

  ngAfterViewInit(): void {
    const component = document.querySelector('sme-uploader');

    component.addEventListener('addedFiles', (event: Event) => {
      this.onAddedFiles(event);
    });

    component.addEventListener('removedFile', (event) => {
      this.onRemovedFiles(event);
    });

    component.addEventListener('uploadedFilesChanged', (event) => {
      this.onUploadedFilesChanged(event);
    });
  }

  onAddedFiles(event: any): void {
    // let newFiles = [];
    // newFiles = this.uploaderService.addFile(event.detail);
    this.addedFiles.emit(event.detail);
  }

  onRemovedFiles(event: any): void {
    this.uploaderService.removeFile(event.detail);

    if (event.detail === 'all') {
      this.uploaderService.clear();
    }
  }

  onUploadedFilesChanged(event: Event): void {
    // this.logger.log('❌Need clear validations list');
  }
}
