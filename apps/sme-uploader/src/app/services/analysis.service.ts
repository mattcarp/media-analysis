import { Injectable } from '@angular/core';

import { UploaderStoreService } from './uploader-store.service';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  errorAnalysis: string[] = [];
  successAnalysis: string[] = [];

  constructor(private storeService: UploaderStoreService) {}

  getIsErrorAnalysis(): boolean {
    const fileList = this.storeService.getFileList();
    return !!fileList.filter((el) => el.analysed === 'error').length;
  }

  checkAnalysis(): void {
    this.storeService.checkAnalysisStatus(
      this.successAnalysis,
      this.errorAnalysis,
    );
  }

  setSuccessAnalysis(array: string) {
    this.successAnalysis = array.replace(/['"\[\]{}\s]/gi, '').split(',');
  }

  setErrorAnalysis(array: string) {
    this.errorAnalysis = array.replace(/['"\[\]{}\s]/gi, '').split(',');
  }
}
