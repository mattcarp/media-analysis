import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromDdpFiles from '../reducers/ddp.reducer';

export const selectDdp = createFeatureSelector<fromDdpFiles.DdpState>(fromDdpFiles.ddpFilesFeatureKey);

export const selectDdpFiles = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.files,
);

export const selectAudioEntries = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.audioEntries,
);

export const selectPqEntries = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.pq.entries,
);

export const selectId = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.id,
);

export const selectMs = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.ms,
);

export const selectPq = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.pq,
);

export const selectValidation = createSelector(
  selectDdp,
  (state: fromDdpFiles.DdpState) => state.validation,
);
