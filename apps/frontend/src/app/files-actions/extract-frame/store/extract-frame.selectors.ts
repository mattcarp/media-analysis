import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromExtractFrame from './extract-frame.reducer';

export const selectExtractFrame = createFeatureSelector<fromExtractFrame.ExtractFrameState>(
  fromExtractFrame.extractFrameFeatureKey,
);

export const selectFileUrl = createSelector(
  selectExtractFrame,
  (state: fromExtractFrame.ExtractFrameState) => state.fileUrl,
);

export const selectIsLoading = createSelector(
  selectExtractFrame,
  (state: fromExtractFrame.ExtractFrameState) => state.isLoading,
);
