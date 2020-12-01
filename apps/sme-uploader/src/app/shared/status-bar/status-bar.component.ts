import { Component, ElementRef, Input, ViewChild } from '@angular/core';

import { HelperService } from '../../services/helper.service';
import { UploaderService } from '../../services/uploader.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: [
    '../../styles/_icons.scss',
    './status-bar.component.scss',
  ],
})
export class StatusBarComponent {
  @Input() theme: string;
  @Input() state: string;
  @ViewChild('progress') progress: ElementRef;
  timeLeft = '00:00';
  uploadSpeed = 0;
  totalSize = 0;
  uploadedSize = 0;
  totalProgress = 0;
  totalFiles = 0;
  uploadedFiles = 0;
  isUploading = false;
  isUploadedFinish = false;
  isErrorUpload = false;
  isFileAdded = false;

  constructor(
    private uploaderService: UploaderService,
    private helperService: HelperService,
  ) {
    this.subscribeOnRefresh();
  }

  subscribeOnRefresh(): void {
    this.uploaderService.onRefresh().subscribe(() => {
      const fileList = this.uploaderService.getFileList();
      const currentUploadedBytes = this.uploaderService.getCurrentBytesUploaded();

      this.isUploading = this.uploaderService.isUploading;
      this.totalFiles = this.uploaderService.getTotalFileSize();
      this.uploadedFiles = this.uploaderService.getTotalUploadedFilesSize();
      this.totalSize = this.uploaderService.getTotalSize();
      this.uploadedSize = this.helperService.getUploadedSize(
        this.totalSize,
        fileList,
        currentUploadedBytes,
      );
      this.uploadSpeed = this.helperService.getUploadSpeed(
        this.uploaderService.getStartedAt(),
        currentUploadedBytes,
      );
      this.totalProgress = this.totalSize ? Math.floor(
        100 * (this.uploadedSize / this.totalSize),
      ) : 0;
      this.setTimeLeft();
      this.isUploadedFinish = this.uploaderService.getNumFilesToUpload() === 0;
      this.updateProgressLine();
      this.isErrorUpload = this.uploaderService.isUploadedError();
      this.getCompleteState();
      this.getErrorState();
      this.getReadyState();
    });
  }

  updateProgressLine(): void {
    this.progress.nativeElement.style.width = this.totalProgress
      .toString()
      .concat('%');
  }

  setTimeLeft() {
    this.timeLeft = this.helperService.getTimeLeft(
      this.totalSize,
      this.uploadedSize,
      this.uploadSpeed,
    );
  }

  getCompleteState(): boolean {
    return this.uploadedFiles && this.isUploadedFinish && !this.isUploading;
  }

  getErrorState(): boolean {
    return this.isErrorUpload && !this.isUploading;
  }

  getReadyState(): boolean {
    return this.theme === 'promo' && !this.isUploading &&
      !this.isUploadedFinish && !this.isErrorUpload;
  }
}
