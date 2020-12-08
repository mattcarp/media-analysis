import { Action, createReducer, on } from '@ngrx/store';

import * as fromActions from './media-files.actions';
import { FileEntry, ValidationState } from './models';

export const mediaFilesFeatureKey = 'media-files';

export interface MediaFilesState {
  files: any[];
  validations: ValidationState[];
  successAnalysisIds: string[];
  errorAnalysisIds: string[];
  analysisResponse: any;
}

const initialState: MediaFilesState = {
  files: [],
  validations: [],
  successAnalysisIds: [],
  errorAnalysisIds: [],
  analysisResponse: null,
};

const mediaFilesReducer = createReducer(
  initialState,
  on(fromActions.setMediaFiles, (state: MediaFilesState, { files }) => ({
    ...state,
    files,
  })),
  on(fromActions.setValidationsState, (state: MediaFilesState, { validations }) => ({
    ...state,
    validations,
  })),
  on(fromActions.setSuccessAnalysisIds, (state: MediaFilesState, { successAnalysisIds }) => ({
    ...state,
    successAnalysisIds,
  })),
  on(fromActions.setErrorAnalysisIds, (state: MediaFilesState, { errorAnalysisIds }) => ({
    ...state,
    errorAnalysisIds,
  })),
  on(fromActions.getAnalysisResponse, (state: MediaFilesState) => ({
    ...state,
    analysisResponse: null,
  })),
  on(fromActions.setAnalysisResponse, (state: MediaFilesState, { analysisResponse }) => ({
    ...state,
    analysisResponse,
  })),
);

export function reducer(state: MediaFilesState | undefined, action: Action) {
  return mediaFilesReducer(state, action);
}
