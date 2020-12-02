import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { getAnalysisResponse, setAnalysisResponse } from './media-files.actions';
import { ValidationService } from './services';

@Injectable()
export class MediaFilesEffects {
  getAnalysisResponse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getAnalysisResponse),
      mergeMap(({ body }) =>
        this.validationService.getAnalysis(body).pipe(
          map((analysisResponse: any) => setAnalysisResponse({ analysisResponse })),
          catchError((error: any) => of(null)),
        ),
      ),
    ),
  );

  constructor(
    private actions$: Actions,
    private validationService: ValidationService,
  ) {}
}
