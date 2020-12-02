import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ModalService } from '../shared/modal/modal.service';
import { MediaFilesService } from '../media-files/store/services';
import {
  selectErrorAnalysisIds,
  selectSuccessAnalysisIds
} from '../media-files/store/selectors/media-files.selectors';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements AfterViewInit, OnDestroy {
  @Output() addedFilesEmit?: EventEmitter<any[]> = new EventEmitter();
  @Output() removedFilesEmit?: EventEmitter<string> = new EventEmitter();
  @Output() uploadedFilesChangedEmit?: EventEmitter<any[]> = new EventEmitter();
  successAnalysisIds: string;
  errorAnalysisIds: string;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private modalService: ModalService,
    private mediaFilesService: MediaFilesService,
    private store: Store<any>,
  ) {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
