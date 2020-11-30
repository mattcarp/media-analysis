import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements AfterViewInit {
  @Output() addedFilesEmit?: EventEmitter<any[]> = new EventEmitter();
  @Output() removedFilesEmit?: EventEmitter<string> = new EventEmitter();
  @Output() uploadedFilesChangedEmit?: EventEmitter<any[]> = new EventEmitter();
  successAnalysisIds: string[] = [];
  errorAnalysisIds: string[] = [];

  ngAfterViewInit(): void {
    const component = document.querySelector('sme-uploader');

    component.addEventListener('addedFiles', (event: Event) => {
      this.onAddedFiles(event);
    });

    component.addEventListener('removedFile', (event: Event) => {
      this.onRemovedFiles(event);
    });

    component.addEventListener('uploadedFilesChanged', (event: Event) => {
      this.onUploadedFilesChanged(event);
    });
  }

  onAddedFiles(event: any): void {
    this.addedFilesEmit.emit(event.detail);
  }

  onRemovedFiles(event: any): void {
    this.removedFilesEmit.emit(event.detail);
  }

  onUploadedFilesChanged(event: any): void {
    // TODO: (?)Need clear validations list
    this.uploadedFilesChangedEmit.emit(event);
  }
}
