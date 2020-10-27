import { createAction, props } from '@ngrx/store';

import { DdpFile, IdState, MsEntry, MsState } from '../models';
import { HashesState } from '../models/hashes-state';

export const setDdpFiles = createAction(
  '[DDP File] Set Files',
  props<{ selectedAt?: Date; path?: string; files: DdpFile[] }>(),
);

export const setAudioEntries = createAction(
  '[DDP File] Set Audio Entries',
  props<{ audioEntries: any[] }>(),
);

export const setMsEntries = createAction(
  '[DDP File] Set Ms Entries',
  props<{ ms: MsEntry[] }>(),
);

export const setPqEntries = createAction(
  '[DDP File] Set Pq Entries',
  props<{ pq: MsEntry[] }>(),
);

export const setIdState = createAction(
  '[DDP File] Set Id State',
  props<{ id: IdState }>(),
);

export const setMsState = createAction(
  '[DDP File] Set Ms State',
  props<{ ms: MsState }>(),
);

export const setHashesState = createAction(
  '[DDP File] Set Hashes State',
  props<{ hashes: HashesState }>(),
);
