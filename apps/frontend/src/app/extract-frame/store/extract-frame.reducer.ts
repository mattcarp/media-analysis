import { Action, createReducer, on } from '@ngrx/store';

import { getFileUrl, setFileUrl } from './extract-frame.actions';

export const extractFrameFeatureKey = 'extract-frame';

export interface ExtractFrameState {
  fileUrl: string;
  isLoading: boolean;
}

const initialState: ExtractFrameState = {
  fileUrl: null,
  isLoading: false,
}

const extractFrameReducer = createReducer(
  initialState,
  on(getFileUrl, ((state: ExtractFrameState)  => ({ ...state, isLoading: true }))),
  on(setFileUrl, ((state: ExtractFrameState, { fileUrl })  => ({
    ...state,
    fileUrl,
    isLoading: false,
  }))),
);

export function reducer(state: ExtractFrameState | undefined, action: Action) {
  return extractFrameReducer(state, action);
}
