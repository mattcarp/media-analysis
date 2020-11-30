import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromReducer from '../reducers/media-files.reducer';

export const selectFiles
  = createFeatureSelector<fromReducer.MediaFilesState>(fromReducer.mediaFilesFeatureKey);

export const selectMediaFiles = createSelector(
  selectFiles,
  (state: fromReducer.MediaFilesState) => state.files,
);

export const selectValidations = createSelector(
  selectFiles,
  (state: fromReducer.MediaFilesState) => state.validations,
);
