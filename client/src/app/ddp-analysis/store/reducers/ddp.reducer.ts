import { Action, createReducer, on } from '@ngrx/store';

import { setAudioEntries, setDdpFiles, setIdState } from '../actions/ddp.actions';
import { FilesState, HashItem, IdState, MsState, PqState } from '../models';
import { HashesState } from '../models/hashes-state';

export const ddpFilesFeatureKey = 'ddp';

export interface DdpState {
  files: FilesState;
  audioEntries: any[];
  ms: MsState,
  pq: PqState,
  id: IdState,
  hashes: HashesState;
}

const initialState: DdpState = {
  files: {
    selectedAt: null,
    path: null,
    files: [],
  },
  audioEntries: [],
  ms: {
    fileName: null,
    fileSize: null,
    lastModified: null,
    entries: [],
  },
  pq: {
    fileName: null,
    fileSize: null,
    lastModified: null,
    entries: [],
  },
  id: {
    fileId: '',
    fileName: '',
    fileSize: null,
    lastModified: null,
    ddpid: '',
    upc: '',
    mss: '',
    msl: '',
    med: '',
    mid: '',
    bk: '',
    type_: '',
    nside: '',
    side: '',
    nlayer: '',
    layer: '',
    txt: '',
  },
  hashes: {
    startedAt: null,
    completedAt: null,
    hashes: [],
  },
};

export const ddpFilesReducer = createReducer(
  initialState,
  on(setDdpFiles, (state: DdpState, { selectedAt, path, files }) => ({
    ...state,
    files: { selectedAt, path, files },
  })),
  on(setAudioEntries, (state: DdpState, { audioEntries }) => ({
    ...state,
    audioEntries,
  })),
  on(setIdState, (state: DdpState, { id }) => ({
    ...state,
    id,
  })),
);

export function reducer(state: DdpState | undefined, action: Action) {
  return ddpFilesReducer(state, action);
}
