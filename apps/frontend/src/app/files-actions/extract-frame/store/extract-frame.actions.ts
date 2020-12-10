import { createAction, props } from '@ngrx/store';

export const getFileUrl = createAction(
  '[Extract Frame] Get File Url',
  props<{ timestamp: string }>(),
);

export const setFileUrl = createAction(
  '[Extract Frame] Set File Url',
  props<{ fileUrl: string }>(),
);

export const requestFailed = createAction(
  '[Extract Frame] Request Failed',
  props<{ error: any }>(),
);

export const downloadFile = createAction(
  '[Extract Frame] Download File',
  props<{ fileUrl: string, fileName: string }>(),
);

export const deleteFile = createAction(
  '[Extract Frame] Delete File',
  props<{ filePath: string }>(),
);
