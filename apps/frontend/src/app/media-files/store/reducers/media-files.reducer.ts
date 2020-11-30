import { Action, createReducer, on } from '@ngrx/store';

import * as fromActions from '../actions/media-files.actions';
import { ValidationState } from '../models';

export const mediaFilesFeatureKey = 'media-files';

export interface MediaFilesState {
  files: [];
  validations: ValidationState[];
}

const initialState: MediaFilesState = {
  files: [],
  validations: [],
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
);

export function reducer(state: MediaFilesState | undefined, action: Action) {
  return mediaFilesReducer(state, action);
}
