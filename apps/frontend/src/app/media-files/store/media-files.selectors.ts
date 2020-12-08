import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromReducer from './media-files.reducer';

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

export const selectSuccessAnalysisIds = createSelector(
  selectFiles,
  (state: fromReducer.MediaFilesState) => state.successAnalysisIds,
);

export const selectErrorAnalysisIds = createSelector(
  selectFiles,
  (state: fromReducer.MediaFilesState) => state.errorAnalysisIds,
);

export const selectAnalysisResponse = createSelector(
  selectFiles,
  (state: fromReducer.MediaFilesState) => state.analysisResponse,
);
