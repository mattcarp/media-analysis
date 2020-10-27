import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromDdpFiles from '../reducers/ddp.reducer';

export const selectJobs = createFeatureSelector<fromDdpFiles.DdpState>(fromDdpFiles.ddpFilesFeatureKey);

export const selectDdpFiles = createSelector(
  selectJobs,
  (state: fromDdpFiles.DdpState) => state.files,
);

export const selectAudioEntries = createSelector(
  selectJobs,
  (state: fromDdpFiles.DdpState) => state.audioEntries,
);

export const selectPqEntries = createSelector(
  selectJobs,
  (state: fromDdpFiles.DdpState) => state.pq.entries,
);
