import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ExtractFrameService } from './extract-frame.service';
import { downloadFile, getFileUrl, requestFailed, setFileUrl } from './extract-frame.actions';

@Injectable()
export class ExtractFrameEffects {
  getFileUrl$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getFileUrl),
      mergeMap(({ timestamp }) =>
        this.extractFrameService.extractFrame(timestamp).pipe(
          map((fileUrl: string) => setFileUrl({ fileUrl })),
          catchError((error: any) => of(requestFailed({ error }))),
        ),
      ),
    ),
  );

  downloadFile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(downloadFile),
      mergeMap(({ fileUrl, fileName }) =>
        this.extractFrameService.downloadFile(fileUrl, fileName).pipe(
          catchError((error: any) => of(requestFailed({ error }))),
        ),
      ),
    ), { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private extractFrameService: ExtractFrameService,
  ) {}
}
