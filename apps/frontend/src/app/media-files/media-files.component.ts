import { Component, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { map, takeUntil } from 'rxjs/operators';

import { FileEntry, ValidationState } from './store/models';
import { selectValidations } from './store/selectors/media-files.selectors';
import { FileTypeService, MediaFilesService } from './store/services';

@Component({
  selector: 'app-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
})
export class MediaFilesComponent implements OnDestroy {
  @Input() files: FileEntry[];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fileTypeService: FileTypeService,
    private mediaFilesService: MediaFilesService,
    private store: Store<any>,
  ) {}

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

  getHasValidation(fileId: string) {
    let isHasValidation = false;

    this.store.pipe(
      select(selectValidations),
      map((validations: ValidationState[]) =>
        validations.filter((item: ValidationState) => item.fileId === fileId)),
      takeUntil(this.destroy$),
    ).subscribe((validations: ValidationState[]) => {
      isHasValidation = !!validations.length;
    });

    return isHasValidation;
  }
}
