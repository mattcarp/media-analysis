import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { FileEntry, ValidationState } from './store/models';
import { selectValidations } from './store/media-files.selectors';
import { FileTypeService, MediaFilesService } from './store/services';

@Component({
  selector: 'app-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
})
export class MediaFilesComponent implements OnInit, OnDestroy {
  @Input() files: FileEntry[];
  @ViewChild('accordion') accordion: ElementRef;
  resultValidation = [];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fileTypeService: FileTypeService,
    private mediaFilesService: MediaFilesService,
    private store: Store<any>,
  ) {
    this.store.pipe(
      select(selectValidations),
      takeUntil(this.destroy$),
    ).subscribe((validations: ValidationState[]) => {
      this.resultValidation = validations;
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFileType(file: any): string {
    return this.fileTypeService.getFileType(file);
  }

  getFileExtensionOrFileName(fileName: string): string {
    const name = this.fileTypeService.getFileNameAndExtension(fileName).name;
    const ext = `*.${this.fileTypeService.getFileNameAndExtension(fileName).extension}`;

    return ext && ext !== '*.undefined' ? ext : name;
  }

  getResultValidation(fileId: string): string {
    let result = 'la-question-circle';
    const res = this.resultValidation.filter(item => item.fileId === fileId);

    if (res.length) {
      res[0].isValid
        ? result = 'la-check-circle'
        : result = 'la-exclamation-circle';
    }

    return result;
  }
}
