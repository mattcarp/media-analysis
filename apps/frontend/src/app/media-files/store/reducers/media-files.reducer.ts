import { Action, createReducer, on } from '@ngrx/store';

import * as fromActions from '../actions/media-files.actions';
import { FileEntry, ValidationState } from '../models';

export const mediaFilesFeatureKey = 'media-files';

export interface MediaFilesState {
  files: FileEntry[];
  validations: ValidationState[];
  successAnalysisIds: string[];
  errorAnalysisIds: string[];
}

const initialState: MediaFilesState = {
  files: [],
  validations: [],
  successAnalysisIds: [],
  errorAnalysisIds: [],
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
);

export function reducer(state: MediaFilesState | undefined, action: Action) {
  return mediaFilesReducer(state, action);
}
