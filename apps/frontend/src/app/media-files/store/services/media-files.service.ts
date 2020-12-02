import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { NGXLogger } from 'ngx-logger';

import { MediaFilesState } from '../media-files.reducer';
import { setMediaFiles } from '../media-files.actions';
import { FileEntry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MediaFilesService {
  parseStartTime: Date = new Date();
  parsedId: any[];
  files: FileEntry[];

  constructor(
    private store: Store<MediaFilesState>,
    private logger: NGXLogger,
  ) {}

  handleFiles(files: any[]): void {
    this.logger.log(`All media files have been added`);
    this.store.dispatch(setMediaFiles({ files }));
  }
}
