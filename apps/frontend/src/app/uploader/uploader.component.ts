import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalService } from '../shared/modal/modal.service';
import { MediaFilesService } from '../media-files/store/services';
import {
  selectErrorAnalysisIds,
  selectMediaFiles,
  selectSuccessAnalysisIds,
} from '../media-files/store/media-files.selectors';
import { setMediaFiles } from '../media-files/store/media-files.actions';
import { FileEntry } from '../media-files/store/models';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements AfterViewInit, OnDestroy {
  files: FileEntry[] = [];
  successAnalysisIds: string;
  errorAnalysisIds: string;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private modalService: ModalService,
    private mediaFilesService: MediaFilesService,
    private store: Store<any>,
  ) {
    this.store.pipe(
      select(selectMediaFiles),
      takeUntil(this.destroy$),
    ).subscribe((files: FileEntry[]) => this.files = files.slice());

    this.store.pipe(
      select(selectSuccessAnalysisIds),
      takeUntil(this.destroy$),
    ).subscribe((successAnalysisIds: string[]) => {
      this.successAnalysisIds = JSON.stringify(successAnalysisIds);
    });

    this.store.pipe(
      select(selectErrorAnalysisIds),
      takeUntil(this.destroy$),
    ).subscribe((errorAnalysisIds: string[]) => {
      this.errorAnalysisIds = JSON.stringify(errorAnalysisIds);
    });
  }

  ngAfterViewInit(): void {
    const component = document.querySelector('sme-uploader');

    component.addEventListener('addedFiles', (event: any) => {
      this.onAddedFiles(event);
    });

    component.addEventListener('removedFile', (event: any) => {
      this.onRemovedFiles(event);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddedFiles(event: any): void {
    setTimeout(() => {
      const newFiles = event.detail.map((item) => {
        const newFile: any = new File([item], item.name, { type: item.type });

        newFile.id = item.id;
        newFile.status = item.status;
        newFile.analysed = item.analysed;
        newFile.preview = item.preview;

        return newFile;
      });

      this.files = this.files.concat(newFiles);
      this.mediaFilesService.handleFiles(this.files);
    }, 100);
  }

  onRemovedFiles(event: any): void {
    const fileId = event.detail;
    let removedFile;

    this.files = this.files.filter((file) => {
      if (file.id === fileId) {
        removedFile = file;
      }

      return file.id !== fileId;
    });

    if (fileId === 'all') {
      this.files = [];
    }

    this.mediaFilesService.handleFiles(this.files);
  }
}
