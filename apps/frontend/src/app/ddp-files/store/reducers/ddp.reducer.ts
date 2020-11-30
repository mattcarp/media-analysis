import { Action, createReducer, on } from '@ngrx/store';

import * as fromDdp from '../actions/ddp.actions';
import {
  FilesState,
  Gracenote,
  HashesState,
  HashItem,
  IdState,
  MsState,
  ParsedCdTextItem,
  ParsedPackItem,
  PlayerAnnotationState,
  PqState,
  ValidationState,
} from '../models';

export const ddpFilesFeatureKey = 'ddp-files';

export interface DdpState {
  files: FilesState;
  audioEntries: any[];
  ms: MsState;
  pq: PqState;
  id: IdState;
  hashes: HashesState;
  validation: ValidationState;
  playerAnnotation: PlayerAnnotationState;
  parsedCdText: ParsedCdTextItem[];
  parsedPackItems: ParsedPackItem[];
  gracenote: Gracenote;
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
  playerAnnotation: {
    start: null,
    end: null,
    msgType: null,
    msg: null,
  },
  parsedCdText: [],
  parsedPackItems: [],
  gracenote: null,
};

const ddpFilesReducer = createReducer(
  initialState,
  on(fromDdp.setDdpFiles, (state: DdpState, { selectedAt, files }) => ({
    ...state,
    files: { ...state.files, selectedAt, files },
  })),
  on(fromDdp.setAudioEntries, (state: DdpState, { audioEntries }) => ({
    ...state,
    audioEntries,
  })),
  on(fromDdp.setIdState, (state: DdpState, { id }) => ({ ...state, id })),
  on(fromDdp.setPqState, (state: DdpState, { pq }) => ({ ...state, pq })),
  on(fromDdp.setHashesState, (state: DdpState, { hashes }) => ({
    ...state,
    hashes,
  })),
  on(fromDdp.setMsState, (state: DdpState, { ms }) => ({ ...state, ms })),
  on(fromDdp.setValidationState, (state: DdpState, { validation }) => ({
    ...state,
    validation,
  })),
  on(fromDdp.setHashItemProgress, (state: DdpState, { hash, progress }) => {
    const hashItems = [...state.hashes.hashes].map((item: HashItem) => {
      return item.hash === hash ? { ...item, progress } : { ...item };
    });
    const hashes = { ...state.hashes, hashes: hashItems };
    return { ...state, hashes };
  }),
  on(fromDdp.setComputedHashItem, (state: DdpState, { hash, computedHash, lastModified }) => {
    const hashItems = [...state.hashes.hashes].map((item: HashItem) => {
      return item.hash === hash ? { ...item, computedHash, lastModified } : { ...item };
    });
    const hashes = { ...state.hashes, hashes: hashItems };
    return { ...state, hashes };
  }),
  on(fromDdp.setPlayerAnnotation, (state: DdpState, { start, end, msgType, msg }) => {
    const playerAnnotation = { ...state.playerAnnotation, start, end, msgType, msg };
    return { ...state, playerAnnotation };
  }),
  on(fromDdp.setParsedCdText, (state: DdpState, { parsedCdText }) => ({
    ...state,
    parsedCdText,
  })),
  on(fromDdp.setParsedPackItems, (state: DdpState, { parsedPackItems }) => ({
    ...state,
    parsedPackItems,
  })),
  on(fromDdp.setGracenote, (state: DdpState, { gracenote }) => ({ ...state, gracenote })),
);

export function reducer(state: DdpState | undefined, action: Action) {
  return ddpFilesReducer(state, action);
}
