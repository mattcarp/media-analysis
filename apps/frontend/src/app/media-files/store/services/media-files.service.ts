import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { FileEntry } from '../models';
import { MediaFilesState } from '../reducers/media-files.reducer';
import { setMediaFiles } from '../actions/media-files.actions';

@Injectable({
  providedIn: 'root',
})
export class MediaFilesService implements OnDestroy {
  parseStartTime: Date = new Date();
  parsedId: any[];
  files: FileEntry[];

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private store: Store<MediaFilesState>,
    private logger: NGXLogger,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleFiles(files: FileEntry[]): void {
    this.logger.log(`All media files have been added`);
    this.store.dispatch(setMediaFiles({ files }));
  }
}
