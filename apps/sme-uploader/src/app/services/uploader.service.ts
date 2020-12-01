import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { HelperService } from './helper.service';
import { UploaderRequestService } from './uploader-request.service';
import { UploaderStoreService } from './uploader-store.service';

@Injectable({ providedIn: 'root' })
export class UploaderService {
  upload;
  startedAt;
  currentBytesUploaded = 0;
  refresh$: Subject<any> = new Subject();
  sortField = '';
  isUploading = false;

  constructor(
    private helperService: HelperService,
    private requestService: UploaderRequestService,
    private storeService: UploaderStoreService,
  ) {}

  init(params) {
    const { apiUrl, deleteUrl, metadata } = params;
    this.requestService.initConfig(apiUrl, deleteUrl, metadata);
  }

  addFile(event: any): any {
    const newFiles = this.storeService.addFile(event);
    this.refresh$.next(true);
    return newFiles;
  }

  deleteFile(fileId: string): void {
    this.storeService.deleteFile(fileId);
    this.refresh$.next({});
  }

  setLimit(limit: string): void {
    this.storeService.setLimit(limit);
  }

  setTypes(types: string): void {
    this.storeService.setTypes(types);
  }

  getFileList(): any[] {
    return this.storeService.getFileList();
  }

  getFileToUpload(): any {
    return this.storeService.getFileToUpload();
  }

  getNumFilesToUpload(): number {
    return this.storeService.getNumFilesToUpload();
  }

  setStartTime(): void {
    this.startedAt = new Date();
  }

  cancelUpload(): void {
    this.upload.abort(true);
    this.isUploading = false;
    this.storeService.cancelUploadingStatus();
    this.currentBytesUploaded = 0;
    this.refresh$.next(true);
  }

  startUpload(): void {
    const file = this.getFileToUpload();
    const fileList = this.storeService.getFileList();

    if (!file) {
      this.finishUploading(fileList);
      return;
    }
    this.isUploading = true;
    this.upload = this.requestService.uploading(
      file,
      this.onErrorUpload.bind(this),
      this.onProgressUpload.bind(this),
      this.onSuccessUpload.bind(this),
    );
    file.status = 'loading';
    this.refresh$.next(true);
    this.upload.start();
  }

  onErrorUpload(error, file): void {
    this.currentBytesUploaded = 0;
    this.upload.abort();
    this.updateFileStatus(file.id, 'error');
    this.refresh$.next(true);
    this.startUpload();

    if (this.isUploadedError()) {
      this.helperService.informer(`Failed to upload ${file.name}`);
    }
  }

  onProgressUpload(file, bytesUploaded): void {
    this.currentBytesUploaded = bytesUploaded;
    this.updateFileStatus(file.id, 'loading');
    this.refresh$.next(true);
  }

  onSuccessUpload(file): void {
    this.currentBytesUploaded = 0;
    this.updateFileStatus(file.id, 'success', true);
    this.helperService.removeFromLocalstorage(this.upload);
    this.startUpload();
    this.refresh$.next(true);
  }

  finishUploading(fileList): void {
    this.isUploading = false;
    this.currentBytesUploaded = 0;
    if (!fileList || !fileList.length) {
      return;
    }
    this.upload.abort();
    const now = new Date().getTime();
    const startTime = this.getStartedAt()?.getTime();
    const totalTime = (now - startTime) / 1000;
    this.refresh$.next({ uploadStatus: 'finished' });

    this.notifyTotalTime(totalTime);
  }

  updateFileStatus(fileId, status, uloaded: boolean = false): void {
    this.storeService.updateFileStatus(fileId, status, this.upload, uloaded);
  }

  isUploadStart(): boolean {
    return this.storeService.isUploadStart();
  }

  isUploadedFinish(): boolean {
    return this.storeService.isUploadedFinish();
  }

  isUploadedError(): boolean {
    return this.storeService.isUploadedError();
  }

  pause(): void {
    this.upload.abort();
  }

  unPause(): void {
    this.upload.start();
  }

  onRefresh(): Subject<boolean> {
    return this.refresh$;
  }

  getStartedAt(): any {
    return this.startedAt;
  }

  setStartedAt(): string {
    this.startedAt = new Date();
    return this.startedAt;
  }

  getTotalUploadedFilesSize(): number {
    return this.storeService.getTotalFileSize();
  }

  getTotalFileSize(): number {
    return this.storeService.getTotalFileSize();
  }

  getCurrentBytesUploaded(): number {
    return this.currentBytesUploaded;
  }

  getTotalSize(): number {
    return this.storeService.getTotalSize();
  }

  getFileUploaded(): File {
    return this.storeService.getFileUploaded();
  }

  getIsUploading(): boolean {
    return this.isUploading;
  }

  clearState(): void {
    this.storeService.clearFileList();
    this.currentBytesUploaded = 0;
    this.isUploading = false;
    this.refresh$.next();
  }

  softClear(): void {
    this.storeService.clearFileList();
    this.refresh$.next();
  }

  clear(action = ''): void {
    const fileList = this.storeService.getFileList();

    fileList?.forEach((file) => {
      this.requestService
        .removeFileFromServer(file?.uploadUrl)
        .subscribe(() => this.successfullLog());
      if (action !== 'onDestroy') {
        this.helperService.informer('All removed successfully');
      }
    });
    this.storeService.clearFileList();
    this.refresh$.next();
  }

  getUploadedFiles(): any[] {
    return this.storeService.getUploadedFiles();
  }

  sortBy(field): void {
    this.storeService.sortBy(field);
    this.refresh$.next(true);
    this.sortField = field;
  }

  private notifyTotalTime(totalTime): void {
    if (!this.isUploadedError()) {
      this.totalTimeLog(totalTime);
      this.helperService.informer(`Uploading total time: ${totalTime} sec.`);
    }
  }

  private totalTimeLog(totalTime): void {
    console.log(
      '%c[SME Uploader]%c Uploading: totalTime',
      'color: grey',
      'color: lime',
      totalTime,
    );
  }

  successfullLog(): void {
    console.log(
      '%c[SME Uploader]%c All removed successfully',
      'color: grey',
      'color: red',
    );
  }
}
