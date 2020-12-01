import { Injectable } from '@angular/core';

import { HelperService } from './helper.service';
import { UploaderRequestService } from './uploader-request.service';

@Injectable({ providedIn: 'root' })
export class UploaderStoreService {
  private fileList = [];
  private sortField = '';
  private conf = {
    allowedTypes: [],
    limit: 0,
  };

  constructor(
    private helperService: HelperService,
    private requestService: UploaderRequestService,
  ) {}

  initConfig(allowedTypes, limit) {
    this.conf = { allowedTypes, limit };
  }

  addFile(event: any): any {
    if (!event) {
      return;
    }
    const newFiles = [];
    let hasForbiddenType = false;
    let hasReachedLimit = false;

    for (const el of event) {
      const fileNameArr = el?.name?.split('.');
      const fileNameType = fileNameArr[fileNameArr.length - 1]; // `someName.mp3` will get `.mp3`
      const params = { fileNameType, hasReachedLimit, el };
      const validationResp = this.hasPassedValidation(params);

      if (validationResp?.passedValidation) {
        const newFile = this.getNewFile(el);

        this.fileList.push(newFile);
        this.createThumbnail(newFile);
        newFiles.push(newFile);
      } else {
        hasForbiddenType = validationResp?.hasForbiddenType || hasForbiddenType;
        hasReachedLimit = validationResp?.hasReachedLimit || hasReachedLimit;
        continue;
      }
    }
    this.showInformer({ hasForbiddenType, hasReachedLimit });
    this.sortBy(this.sortField || 'name');

    return newFiles;
  }

  hasPassedValidation(options): any {
    const { hasReachedLimit, fileNameType, el } = options;

    if (this.hasDuplication(el)) {
      return {
        passedValidation: false,
        hasDuplication: true,
      };
    }

    if (hasReachedLimit || !this.isAllowedLimit()) {
      return {
        hasReachedLimit: true,
        passedValidation: false,
      };
    }

    if (!this.isAllowedType(fileNameType.toLowerCase())) {
      return {
        hasForbiddenType: true,
        passedValidation: false,
      };
    }

    return {
      passedValidation: true,
    };
  }

  hasDuplication(file): boolean {
    const res = !!this.fileList.filter(
      (el) => file.name === el.name && file.size === el.size,
    ).length;

    if (res) {
      this.helperService.informer(
        `Cannot add the duplicate file ${file.name}, it already exists`,
      );
    }

    return res;
  }

  isAllowedType(fileNameType) {
    return (
      this.conf.allowedTypes.length === 0 ||
      this.conf.allowedTypes.includes(fileNameType)
    );
  }

  isAllowedLimit() {
    return this.conf.limit === 0 || this.conf.limit > this.fileList.length;
  }

  deleteFile(fileId: string): void {
    let removedFile;
    this.fileList = this.fileList.filter((file) => {
      if (file.id === fileId) {
        removedFile = file;
        this.requestService
          .removeFileFromServer(file?.uploadUrl)
          .subscribe(() =>
            console.log(
              '%c[SME Uploader]%c Removed successfully',
              'color: grey',
              'color: orange',
            ),
          );
        this.helperService.informer('Removed successfully');
      }
      return file.id !== fileId;
    });
  }

  updateFileStatus(fileId, status, upload, uloaded: boolean = false): void {
    this.fileList = this.fileList.map((file) => {
      if (file.id === fileId && file.status !== 'success') {
        file.uploaded = uloaded;
        file.status = status;
        if (uloaded) {
          file.uploadUrl = upload.url;
        }
      }

      return file;
    });
  }

  checkAnalysisStatus(successAnalysis, errorAnalysis): void {
    this.fileList.forEach((file) => {
      if (successAnalysis.includes(file.id)) {
        file.analysed = 'success';
      }
      if (errorAnalysis.includes(file.id)) {
        file.analysed = 'error';
      }
    });
  }

  getTotalSize(): number {
    return this.fileList.reduce((accumulator, currentFile) => {
      return accumulator + currentFile.size;
    }, 0);
  }

  getFileUploaded(): File {
    return this.fileList.reduce((accumulator, currentFile) => {
      if (currentFile.status === 'success') {
        accumulator += 1;
      }
      return accumulator;
    }, 0);
  }

  clearFileList() {
    this.fileList = [];
  }

  sortBy(field): void {
    this.fileList = this.fileList.sort((a, b) =>
      this.helperService.sortFn(a, b, field),
    );
  }

  getUploadedFiles(): any[] {
    return this.fileList.filter((file) => file?.status === 'success');
  }

  getFileList(): any[] {
    return this.fileList;
  }

  cancelUploadingStatus(): void {
    this.fileList = this.fileList.map((file) => {
      if (file.status === 'loading') {
        file.status = 'new';
      }
      return file;
    });
  }

  getTotalFileSize(): number {
    return this.fileList?.length ?? 0;
  }

  getTotalUploadedFilesSize(): number {
    return (
      this.fileList.filter((file) => file.status === 'success')?.length ?? 0
    );
  }

  isUploadStart(): boolean {
    return !this.fileList.find(
      (file) => !file.uploaded && file.status === 'new',
    );
  }

  isUploadedFinish(): boolean {
    return !this.fileList.find(
      (file) => file.status === 'ready' || file.status === 'loading',
    );
  }

  isUploadedError(): boolean {
    return !!this.fileList.find((file) => file.status === 'error');
  }

  getFileToUpload(): any {
    return this.fileList.find((file) => file && file.status === 'new');
  }

  getNumFilesToUpload(): number {
    return this.fileList.length - this.getUploadedFiles().length;
  }

  setLimit(limit: string): void {
    this.conf.limit = +limit;

    if (limit === '0') {
      this.conf.limit = 0;
    }
  }

  setTypes(types: string): void {
    if (types === '*') {
      this.conf.allowedTypes = [];
    } else {
      this.conf.allowedTypes = types.replace(/:/gi, '').split('*.');
    }
  }

  isNewFile(): boolean {
    return this.fileList.find((file) => file.status === 'new');
  }

  private createThumbnail(file): void {
    if (file?.type?.includes('image')) {
      const reader = new FileReader();

      reader.onloadend = () => {
        file.preview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private showInformer(params) {
    const { hasForbiddenType, hasReachedLimit } = params;

    if (hasForbiddenType) {
      this.helperService.informer(
        'Uploader does not support the file type you are trying to add. \nIt has been removed.',
      );
    }

    if (hasReachedLimit) {
      this.helperService.informer(
        `Uploader has reached limit of ${this.conf.limit}. Another files will be ignored`,
      );
    }
  }

  private getNewFile(file) {
    file.id = this.helperService.getID();
    file.status = 'new';
    file.analysed = 'null';

    return file;
  }
}
