import { Action, createReducer, on } from '@ngrx/store';

import * as fromDdp from '../actions/ddp.actions';
import {
  FilesState,
  HashesState,
  IdState,
  MsState,
  PqState,
  ValidationState,
} from '../models';

export const ddpFilesFeatureKey = 'ddp';

export interface DdpState {
  files: FilesState;
  audioEntries: any[];
  ms: MsState;
  pq: PqState;
  id: IdState;
  hashes: HashesState;
  validation: ValidationState;
}

const initialState: DdpState = {
  files: {
    selectedAt: null,
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
  validation: {
    created: null,
    failCount: 0,
    entries: [],
  },
};

const ddpFilesReducer = createReducer(
  initialState,
  on(fromDdp.setDdpFiles, (state: DdpState, { selectedAt, files }) => ({
    ...state,
    files: { selectedAt, files },
  })),
  on(fromDdp.setAudioEntries, (state: DdpState, { audioEntries }) => ({
    ...state,
    audioEntries,
  })),
  on(fromDdp.setIdState, (state: DdpState, { id }) => ({
    ...state,
    id,
  })),
);

export function reducer(state: DdpState | undefined, action: Action) {
  return ddpFilesReducer(state, action);
}
