import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { FileEntry, ValidationState } from './media-files/store/models';
import {
  selectMediaFiles,
  selectValidations,
} from './media-files/store/media-files.selectors';
import { setMediaFiles } from './media-files/store/media-files.actions';

@Component({
  selector: 'app-files-upload',
  templateUrl: './files-upload.component.html',
  styleUrls: ['./files-upload.component.scss'],
})
export class FilesUploadComponent implements OnDestroy {
  files: FileEntry[] = [];
  filesCount = 0;
  isAddedFiles = false;
  isAnalysedFiles = false;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private store: Store<any>,
  ) {
    this.store.pipe(
      select(selectMediaFiles),
      takeUntil(this.destroy$),
    ).subscribe((files: FileEntry[]) => {
      this.files = files.slice();

      if (this.files.length > this.filesCount) {
        this.changeAnimation('input');
      }
      this.filesCount = this.files.length;
    });

    this.store.pipe(
      select(selectValidations),
      takeUntil(this.destroy$),
    ).subscribe((validations: ValidationState[]) => {
      if (validations.length) {
        setTimeout(() => {
          this.changeAnimation('output');
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(setMediaFiles({ files: [] }));
    this.destroy$.next();
    this.destroy$.complete();
  }

  isDDP(files: any[]): boolean {
    let isDDPPQ = false;
    let isDDPMS = false;
    let isDDPID = false;

    files.forEach((file: File) => {
      if (file.name === 'DDPPQ') {
        isDDPPQ = true;
      }
      if (file.name === 'DDPMS') {
        isDDPMS = true;
      }
      if (file.name === 'DDPID') {
        isDDPID = true;
      }
    });

    return isDDPPQ && isDDPMS && isDDPID;
  }

  changeAnimation(direction: string): void {
    if (direction === 'input')  {
      this.isAddedFiles = true;
    }
    if (direction === 'output')  {
      this.isAnalysedFiles = true;
    }
    setTimeout(() => {
      this.isAddedFiles = false;
      this.isAnalysedFiles = false;
    }, 1500);
  }
}
